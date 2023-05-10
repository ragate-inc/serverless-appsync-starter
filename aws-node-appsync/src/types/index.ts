import { ArgumentError } from 'exceptions/index';
import _ from 'lodash';

// dynamodb tables
export enum DYNAMO_TABLES {
  Foo = 'Foo',
  Hoge = 'Hoge',
  IdempotenceProcess = 'IdempotenceProcess',
}

// aws regions
export type AWS_REGION =
  | 'ap-northeast-1'
  | 'us-east-2'
  | 'us-east-1'
  | 'us-west-1'
  | 'us-west-2'
  | 'af-south-1'
  | 'ap-east-1'
  | 'ap-south-2'
  | 'ap-southeast-3'
  | 'ap-southeast-3'
  | 'ap-southeast-4'
  | 'ap-south-1'
  | 'ap-northeast-3'
  | 'ap-northeast-2'
  | 'ap-southeast-1'
  | 'ap-southeast-2'
  | 'ap-northeast-1'
  | 'ca-central-1'
  | 'eu-central-1'
  | 'eu-west-1'
  | 'eu-west-2'
  | 'eu-south-1'
  | 'eu-west-3'
  | 'eu-south-2'
  | 'eu-north-1'
  | 'eu-central-2'
  | 'me-south-1'
  | 'me-central-1'
  | 'sa-east-1'
  | 'us-gov-east-1'
  | 'us-gov-west-1';

// use for wrapping aws sdk service class
export abstract class AwsSdkServiceAbstract {
  protected constructor(args?: { region?: AWS_REGION; prefix?: string }) {
    this._region = (args?.region || process.env.REGION) as AWS_REGION;
    this._prefix = ((args?.prefix || process.env.AWS_RESOURCE_PRIFIX) as string) || '';
    if (_.isEmpty(this.region)) {
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
  }
  private readonly _region: AWS_REGION;
  private readonly _prefix: string;
  protected get region(): AWS_REGION {
    return this._region;
  }
  protected get prefix(): string {
    return this._prefix;
  }
}
