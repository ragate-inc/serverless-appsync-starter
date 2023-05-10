import logger from 'utils/logger';
import * as Lambda from '@aws-sdk/client-lambda';
import _ from 'lodash';
import { AWSSDKError } from 'exceptions/index';
import { AWS_REGION, AwsSdkServiceAbstract } from 'types/index';

export default class extends AwsSdkServiceAbstract {
  constructor(args?: { region?: AWS_REGION; prefix?: string }) {
    super(args);
    this._client = new Lambda.LambdaClient({
      region: this.region,
    });
  }
  private readonly _client: Lambda.LambdaClient;

  private get client(): Lambda.LambdaClient {
    return this._client;
  }

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
      FunctionName: this.prefix + args.functionName,
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
      return await this.client.send(command);
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
