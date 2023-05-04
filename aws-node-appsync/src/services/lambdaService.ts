import logger from 'utils/logger';
import * as Lambda from '@aws-sdk/client-lambda';
import _ from 'lodash';
import { ArgumentError, AWSSDKError } from 'exceptions/index';
import { AWS_REGION } from 'types/index';

export default class {
  constructor(args?: { region?: AWS_REGION; prefix?: string }) {
    this._region = (args?.region || process.env.REGION) as AWS_REGION;
    this._prefix = ((args?.prefix || process.env.AWS_RESOURCE_PRIFIX) as AWS_REGION) || '';
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
    this._client = new Lambda.LambdaClient({
      region: this._region,
    });
  }
  private _region: AWS_REGION;
  private _client: Lambda.LambdaClient;
  private _prefix: string;

  /**
   * Lambda call
   * @param functionName Lambda function name (no need to specify prefix)
   * @param payload Payload to be passed to Lambda
   * @param invocationType Lambda invocation type
   */
  public invokeLambda = async (args: {
    functionName: string;
    payload?: Record<string, unknown>;
    invocationType: 'Event' | 'RequestResponse' | 'DryRun';
  }): Promise<Lambda.InvokeCommandOutput> => {
    logger.info('lambdaService.invokeLambda', args);
    const params: Lambda.InvokeCommandInput = {
      FunctionName: this._prefix + args.functionName,
      InvocationType: args.invocationType || 'RequestResponse',
    };
    if (args.payload) {
      const str = JSON.stringify(args.payload);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(str);
      _.assign(params, {
        Payload: encoded,
      });
    }
    const command = new Lambda.InvokeCommand(params);
    try {
      return await this._client.send(command);
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
