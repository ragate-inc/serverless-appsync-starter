import logger from 'utils/logger';
import { ArgumentError, AWSSDKError, DynamoDBAlreadyExistsError } from 'exceptions/index';
import _ from 'lodash';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as LibDynamodb from '@aws-sdk/lib-dynamodb';
import moment from 'moment-timezone';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import NextToken from 'utils/nextToken';
import { AWS_REGION, TABLES } from 'types/index';

type MakeUpdateItemCondition = {
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: Record<string, unknown>;
  ConditionExpression: string;
  UpdateExpression: string;
  Key: Record<string, unknown>;
};

export default class {
  constructor(args?: { region?: AWS_REGION; tablePrefix?: string }) {
    this._region = (args?.region || process.env.REGION) as AWS_REGION;
    this._prefix = ((args?.tablePrefix || process.env.AWS_RESOURCE_PRIFIX) as AWS_REGION) || '';
    if (_.isEmpty(this._region)) {
      throw new ArgumentError(
        `Environment variable "REGION" or argument is not set \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    this._client = new DynamoDBClient({
      region: this._region,
    });
    this._docClient = LibDynamodb.DynamoDBDocumentClient.from(this._client);
  }

  private _region: AWS_REGION;
  private _prefix: string;
  private _docClient: LibDynamodb.DynamoDBDocumentClient;
  private _client: DynamoDBClient;

  private _addCreatedAt = <T>(item: T): T => ({
    ...item,
    CreatedAt: moment().tz('Asia/Tokyo').format(),
  });

  private _addUpdatedAt = <T>(item: T): T => ({
    ...item,
    UpdatedAt: moment().tz('Asia/Tokyo').format(),
  });

  /**
   * GetItem Operation
   * @param getItemCommandInput SDK parameter
   */
  public getItem = async (args: { getItemCommandInput: LibDynamodb.GetCommandInput }): Promise<LibDynamodb.GetCommandOutput> => {
    logger.info('dynamoService.getItem', args.getItemCommandInput);
    if (_.isEmpty(args.getItemCommandInput.TableName)) {
      throw new ArgumentError(
        `Argument "args.getItemCommandInput.TableName" , is unset \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const params: LibDynamodb.GetCommandInput = _.chain(args.getItemCommandInput)
      .cloneDeep()
      .assign({ TableName: `${this._prefix}${args.getItemCommandInput.TableName as string}` })
      .value();
    const command = new LibDynamodb.GetCommand(params);
    try {
      return await this._docClient.send(command);
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * Query Operation
   * @param queryCommandInput SDK parameters
   */
  public query = async (args: { queryCommandInput: LibDynamodb.QueryCommandInput & { NextToken?: string } }): Promise<LibDynamodb.QueryCommandOutput & { NextToken?: string }> => {
    logger.info('dynamoService.query', args.queryCommandInput);
    if (_.isEmpty(args.queryCommandInput.TableName)) {
      throw new ArgumentError(
        `Argument "args.queryCommandInput.TableName" , is unset. \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const params: LibDynamodb.QueryCommandInput = (await _.chain(args.queryCommandInput)
      .cloneDeep()
      .assign({ TableName: `${this._prefix}${args.queryCommandInput.TableName as string}` })
      .thru(async (item) => {
        const res = await this._addExclusiveStartKeyByNextToken({
          item,
          nextToken: item.NextToken,
        });
        return _.omit(res, ['NextToken']);
      })
      .value()) as LibDynamodb.QueryCommandInput;
    const command = new LibDynamodb.QueryCommand(params);
    try {
      const res = await this._docClient.send(command);
      if (res.LastEvaluatedKey) {
        const isExistNextItem = await this.isExistNextItemByLastEvaluatedKey({
          queryCommandInput: params,
          lastEvaluatedKey: res.LastEvaluatedKey,
        });
        if (isExistNextItem) {
          return {
            ...res,
            NextToken: NextToken.sign(res.LastEvaluatedKey),
          };
        }
      }
      return res;
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * Scan operation
   * @param scanCommandInput SDK parameters
   */
  public scan = async (args: { scanCommandInput: LibDynamodb.ScanCommandInput & { NextToken?: string } }): Promise<LibDynamodb.ScanCommandOutput & { NextToken?: string }> => {
    logger.info('dynamoService.scan', args);
    if (_.isEmpty(args.scanCommandInput.TableName)) {
      throw new ArgumentError(
        `Argument "args.scanCommandInput.TableName" , is unset. \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const params: LibDynamodb.ScanCommandInput = (await _.chain(args.scanCommandInput)
      .cloneDeep()
      .assign({ TableName: `${this._prefix}${args.scanCommandInput.TableName as string}` })
      .thru(async (item) => {
        const res = await this._addExclusiveStartKeyByNextToken({
          item,
          nextToken: item.NextToken,
        });
        return _.omit(res, ['NextToken']);
      })
      .value()) as LibDynamodb.ScanCommandInput;
    const command = new LibDynamodb.ScanCommand(params);
    try {
      const res = await this._docClient.send(command);
      if (res.LastEvaluatedKey) {
        const isExistNextItem = await this.isExistNextItemByLastEvaluatedKeyForScan({
          scanCommandInput: params,
          lastEvaluatedKey: res.LastEvaluatedKey,
        });
        if (isExistNextItem) {
          return {
            ...res,
            NextToken: NextToken.sign(res.LastEvaluatedKey),
          };
        }
      }
      return res;
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * DeleteItem Operation
   * @param deleteItemCommandInput SDK parameter
   */
  public deleteItem = async (args: { deleteItemCommandInput: LibDynamodb.DeleteCommandInput }): Promise<LibDynamodb.DeleteCommandOutput> => {
    logger.info('dynamoService.deleteItem', args.deleteItemCommandInput);
    if (_.isEmpty(args.deleteItemCommandInput.TableName)) {
      throw new ArgumentError(
        `Argument "args.deleteItemCommandInput.TableName" , is unset \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const params: LibDynamodb.DeleteCommandInput = _.chain(args.deleteItemCommandInput)
      .cloneDeep()
      .assign({ TableName: `${this._prefix}${args.deleteItemCommandInput.TableName as string}` })
      .value();
    const command = new LibDynamodb.DeleteCommand(params);
    try {
      return await this._docClient.send(command);
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * PutItem operation
   * @param attributeValue attribute value
   */
  public putItem = async (args: { putItemCommandInput: LibDynamodb.PutCommandInput }): Promise<LibDynamodb.PutCommandOutput> => {
    logger.info('dynamoService.putItem', args);
    if (_.isEmpty(args.putItemCommandInput.TableName)) {
      throw new ArgumentError(
        `Argument "args.putItemCommandInput.TableName" , is unset \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const params: LibDynamodb.PutCommandInput = _.chain(args.putItemCommandInput)
      .cloneDeep()
      .assign({ TableName: `${this._prefix}${args.putItemCommandInput.TableName as string}` })
      .assign({
        Item: _.chain(args.putItemCommandInput.Item)
          .thru((item) => (_.has(item, 'CreatedAt') ? item : this._addCreatedAt(item)))
          .thru((item) => (_.has(item, 'UpdatedAt') ? item : this._addUpdatedAt(item)))
          .value(),
      })
      .value();
    const command = new LibDynamodb.PutCommand(params);
    try {
      return await this._docClient.send(command);
    } catch (e) {
      const err: Error = e as Error;
      if (err.name === 'ConditionalCheckFailedException' && _.includes(_.get(args.putItemCommandInput, 'ConditionExpression', ''), 'attribute_not_exists')) {
        throw new DynamoDBAlreadyExistsError(
          JSON.stringify(
            {
              stack: err.stack,
              name: err.name,
              message: err.message,
            },
            null,
            2
          )
        );
      }
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * BatchWrite operation
   * @param tableName table name
   * @param writeRequests Write values
   */
  public batchWriteWithUnprocessedItems = async (args: {
    tableName: TABLES;
    writeRequests: Record<string, NativeAttributeValue>[];
  }): Promise<LibDynamodb.BatchWriteCommandOutput | undefined> => {
    logger.info('dynamoService.batchWriteWithUnprocessedItems', args);
    const _tableName: string = this._prefix + args.tableName;
    const _batchWrite = async (requestItems: Record<string, NativeAttributeValue>[]) => {
      const params: LibDynamodb.BatchWriteCommandInput = {
        RequestItems: {
          [_tableName]: requestItems,
        },
      };
      const command = new LibDynamodb.BatchWriteCommand(params);
      const res = await this._docClient.send(command);
      return res.UnprocessedItems;
    };
    const unprocessedItems = await Promise.all(
      _.chain(args.writeRequests)
        .chunk(25)
        .map((items) => _batchWrite(items))
        .value()
    );
    const filteredUnprocessedItems: Record<string, NativeAttributeValue>[] = _.reduce(
      unprocessedItems,
      (result: Record<string, NativeAttributeValue>[], item) => {
        if (_.isEmpty(item)) return result;
        const currentItems = item[_tableName];
        if (_.isEmpty(currentItems)) return result;
        result = _.union(
          result,
          _.filter(currentItems, (item) => !(_.isEmpty(item.PutRequest) && _.isEmpty(item.DeleteRequest)))
        );
        return result;
      },
      []
    );
    try {
      if (_.size(filteredUnprocessedItems) > 0) {
        return await this.batchWriteWithUnprocessedItems({
          tableName: args.tableName,
          writeRequests: filteredUnprocessedItems,
        });
      }
      return;
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * transactWriteCommandInput operation
   * @param transactWriteCommandInput attribute value
   */
  public transactWrite = async (args: { transactWriteCommandInput: LibDynamodb.TransactWriteCommandInput }): Promise<LibDynamodb.TransactWriteCommandOutput> => {
    logger.info('dynamoService.transactWrite', args);
    const _hasValueInObject = (values: Record<string, unknown>, target: string): boolean =>
      _.reduce(
        values,
        (result: boolean, value: unknown) => {
          if (value === target) result = true;
          return result;
        },
        false
      );
    const params: LibDynamodb.TransactWriteCommandInput = _.chain(args.transactWriteCommandInput.TransactItems)
      .cloneDeep()
      .map((v) =>
        _.reduce(
          v,
          (result, value, key) => {
            if (!value) return result;
            const k = key as 'Put' | 'Delete' | 'Update' | 'ConditionCheck';
            const tableName = v[k]?.TableName;
            if (_.isEmpty(tableName)) {
              throw new ArgumentError(`TableName is required \n ${JSON.stringify(args, null, 2)}`);
            }
            result[k] = _.chain(v[k])
              .cloneDeep()
              .assign({
                TableName: `${this._prefix}${tableName as string}`,
              })
              .thru((item) => {
                if (k === 'Put') {
                  const v = item as LibDynamodb.PutCommandInput;
                  if (!_.has(v.Item, 'CreatedAt')) v.Item = this._addCreatedAt(v.Item);
                  if (!_.has(v.Item, 'UpdatedAt')) v.Item = this._addUpdatedAt(v.Item);
                  return v;
                } else if (k === 'Update') {
                  const v = item as LibDynamodb.UpdateCommandInput;
                  const expressionAttributeNames = v.ExpressionAttributeNames;
                  if (_.isEmpty(expressionAttributeNames)) throw new ArgumentError(`ExpressionAttributeNames is required \n ${JSON.stringify(args, null, 2)}`);
                  const expressionAttributeValues = v.ExpressionAttributeValues;
                  if (_.isEmpty(expressionAttributeValues)) throw new ArgumentError(`ExpressionAttributeValues is required \n ${JSON.stringify(args, null, 2)}`);
                  if (_.isEmpty(v.UpdateExpression)) throw new ArgumentError(`UpdateExpression is required \n ${JSON.stringify(args, null, 2)}`);
                  if (!_hasValueInObject(expressionAttributeNames, 'UpdatedAt')) {
                    expressionAttributeNames['#UpdatedAt'] = 'UpdatedAt';
                    expressionAttributeValues[':UpdatedAt'] = moment().tz('Asia/Tokyo').format();
                    v.UpdateExpression = `${v.UpdateExpression as string}, #UpdatedAt = :UpdatedAt`;
                  }
                  return v;
                } else return item;
              })
              .value();
            return result;
          },
          {} as Record<string, unknown>
        )
      )
      .thru((items) => ({
        TransactItems: items,
      }))
      .value();

    const command = new LibDynamodb.TransactWriteCommand(params);
    try {
      return await this._docClient.send(command);
    } catch (e) {
      const err: Error = e as Error;
      if (err.name === 'ConditionalCheckFailedException') {
        throw new DynamoDBAlreadyExistsError(
          JSON.stringify(
            {
              stack: err.stack,
              name: err.name,
              message: err.message,
            },
            null,
            2
          )
        );
      }
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * Dynamically generate various Conditions for UpdateItem.
   * Note that the attributes of UpdatedAt are not assigned.
   * @param keyNames
   * @param attributes
   */
  private _makeUpdateItemCondition = (args: { keyNames: string[]; attributes: Record<string, NativeAttributeValue> }): MakeUpdateItemCondition => {
    const key = _.pick(args.attributes, args.keyNames);
    const expressionKeys = _.difference(_.keys(args.attributes), args.keyNames);
    return _.chain(args.attributes)
      .reduce(
        (condition, value, key) => {
          condition.ExpressionAttributeNames[`#${key}`] = key;
          if (_.includes(expressionKeys, key)) condition.ExpressionAttributeValues[`:${key}`] = value as unknown;
          return condition;
        },
        {
          ExpressionAttributeNames: {} as Record<string, string>,
          ExpressionAttributeValues: {} as Record<string, unknown>,
        }
      )
      .assign({
        ConditionExpression: _.chain(args.keyNames)
          .map((keyName) => `attribute_exists(#${keyName})`)
          .join(' and ')
          .value(),
      })
      .assign({
        UpdateExpression: `set ${_.chain(expressionKeys)
          .map((key) => `#${key} = :${key}`)
          .join(',')
          .value()}`,
      })
      .assign({
        Key: key,
      })
      .value();
  };

  /**
   * UpdateItem operation
   * @param tableName table name
   * @param keyNames Index attribute name
   * @param attributes written value
   */
  public updateAttributes = async (args: {
    tableName: TABLES;
    keyNames: string[];
    attributes: Record<string, NativeAttributeValue>;
    returnValues: 'ALL_NEW' | 'ALL_OLD' | 'NONE' | 'UPDATED_NEW' | 'UPDATED_OLD';
  }): Promise<LibDynamodb.UpdateCommandOutput> => {
    logger.info('dynamoService.updateAttributes', args);
    const returnValues = args.returnValues || 'UPDATED_NEW';

    // Update date added
    const _attributes: Record<string, NativeAttributeValue> = _.chain(args.attributes)
      .cloneDeep()
      .thru((item) => (_.has(item, 'UpdatedAt') ? item : this._addUpdatedAt<Record<string, NativeAttributeValue>>(item)))
      .value();

    // Create renewal conditions
    const _updateConditions = this._makeUpdateItemCondition({
      keyNames: args.keyNames,
      attributes: _attributes,
    });

    const params: LibDynamodb.UpdateCommandInput = {
      TableName: this._prefix + args.tableName,
      Key: _updateConditions.Key,
      ReturnValues: returnValues,
      ExpressionAttributeNames: _updateConditions.ExpressionAttributeNames,
      ExpressionAttributeValues: _updateConditions.ExpressionAttributeValues,
      ConditionExpression: _updateConditions.ConditionExpression,
      UpdateExpression: _updateConditions.UpdateExpression,
    };

    const command = new LibDynamodb.UpdateCommand(params);
    try {
      return await this._docClient.send(command);
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * Verify whether the next Item using lastEvaluatedKey exists or not.
   * @param queryCommandInput
   * @param lastEvaluatedKey
   */
  public isExistNextItemByLastEvaluatedKey = async (args: { queryCommandInput: LibDynamodb.QueryCommandInput; lastEvaluatedKey: Record<string, unknown> }): Promise<boolean> => {
    logger.info('dynamoService.isExistNextItemByLastEvaluatedKey', args);
    if (_.isEmpty(args?.queryCommandInput?.TableName)) {
      throw new ArgumentError(
        `Argument "args.queryCommandInput.TableName" is unset \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const tableName = `${this._prefix}${args.queryCommandInput.TableName as string}`;
    const params: LibDynamodb.QueryCommandInput = _.chain(args.queryCommandInput)
      .cloneDeep()
      .assign({ TableName: tableName, ExclusiveStartKey: args.lastEvaluatedKey, Limit: 1 })
      .value();
    const command = new LibDynamodb.QueryCommand(params);
    try {
      const res = await this._docClient.send(command);
      return res.Count ? res.Count > 0 : false;
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * Verifies whether or not the next Item exists using lastEvaluatedKey (for Scan operation)
   * @param scanCommandInput
   * @param lastEvaluatedKey
   */
  public isExistNextItemByLastEvaluatedKeyForScan = async (args: {
    scanCommandInput: LibDynamodb.ScanCommandInput;
    lastEvaluatedKey: Record<string, unknown>;
  }): Promise<boolean> => {
    logger.info('dynamoService.isExistNextItemByLastEvaluatedKeyForScan', args);
    if (_.isEmpty(args?.scanCommandInput?.TableName)) {
      throw new ArgumentError(
        `Argument "args.scanCommandInput.TableName" is not set \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const tableName = `${this._prefix}${args.scanCommandInput.TableName as string}`;
    const params: LibDynamodb.ScanCommandInput = _.chain(args.scanCommandInput)
      .cloneDeep()
      .assign({ TableName: tableName, ExclusiveStartKey: args.lastEvaluatedKey, Limit: 1 })
      .value();
    const command = new LibDynamodb.ScanCommand(params);
    try {
      const res = await this._docClient.send(command);
      return res.Count ? res.Count > 0 : false;
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        JSON.stringify(
          {
            stack: err.stack,
            name: err.name,
            message: err.message,
          },
          null,
          2
        )
      );
    }
  };

  /**
   * Decode NextToken and generate ExclusiveStartKey
   * @param item
   * @param nextToken
   */
  private _addExclusiveStartKeyByNextToken = async <T>(args: { item: T; nextToken?: string }): Promise<T> => {
    logger.info('dynamoService.addExclusiveStartKeyByNextToken', args);
    if (!args.nextToken || _.isEmpty(args.nextToken)) return args.item;
    const decoded = await NextToken.verify(args.nextToken);
    if (!decoded) return args.item;
    return {
      ...args.item,
      ExclusiveStartKey: _.omit(decoded, ['iat']),
    };
  };
}
