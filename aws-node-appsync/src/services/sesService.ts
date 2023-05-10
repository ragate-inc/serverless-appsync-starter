import logger from 'utils/logger';
import * as Ses from '@aws-sdk/client-ses';
import { AWSSDKError } from 'exceptions/index';
import { AWS_REGION, AwsSdkServiceAbstract } from 'types/index';

export default class extends AwsSdkServiceAbstract {
  constructor(args?: { region?: AWS_REGION }) {
    super(args);
    this._client = new Ses.SESClient({
      region: this.region,
    });
  }

  private readonly _client: Ses.SESClient;

  private get client(): Ses.SESClient {
    return this._client;
  }

  public sendEmail = async (args: { sendEmailCommandInput: Ses.SendEmailCommandInput }): Promise<Ses.SendEmailCommandOutput> => {
    logger.info('sesService.sendEmail', args);
    const command = new Ses.SendEmailCommand(args.sendEmailCommandInput);
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
