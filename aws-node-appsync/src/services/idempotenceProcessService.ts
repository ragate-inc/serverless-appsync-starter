import _ from 'lodash';
import { AWSSDKError } from 'exceptions/index';
import * as LibDynamodb from '@aws-sdk/lib-dynamodb';
import DynamoService from 'services/dynamoService';
import { DYNAMO_TABLES } from 'types/index';

export default class {
  public static lockProcess = async (args: { id: string; ttl?: number }): Promise<boolean> => {
    const { id, ttl } = args;
    const params: LibDynamodb.PutCommandInput = _.chain({
      TableName: DYNAMO_TABLES.IdempotenceProcess,
      Item: {
        Id: id,
      },
      ConditionExpression: 'attribute_not_exists(Id)',
    })
      .thru((v) => (ttl ? _.assign({}, { ...v, TTL: ttl }) : v))
      .value();
    try {
      const dynamodbService = new DynamoService();
      await dynamodbService.putItem({
        putItemCommandInput: params,
      });
      return true;
    } catch (e) {
      const err: Error = e as Error;
      if (err.name === 'AlreadyExistsError') {
        return false;
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

  public static unlockProcess = async (args: { id: string }): Promise<void> => {
    const { id } = args;
    const params: LibDynamodb.DeleteCommandInput = {
      TableName: DYNAMO_TABLES.IdempotenceProcess,
      Key: {
        Id: id,
      },
    };
    try {
      const dynamodbService = new DynamoService();
      await dynamodbService.deleteItem({
        deleteItemCommandInput: params,
      });
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
}
