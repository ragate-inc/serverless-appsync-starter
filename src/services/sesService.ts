import logger from 'utils/logger';
import * as Ses from '@aws-sdk/client-ses';
import _ from 'lodash';
import { AgreementError, AWSSDKError } from 'exceptions/index';
import { AWS_REGION } from 'types/index';

export default class {
  constructor(args?: { region?: AWS_REGION }) {
    this._region = (args?.region || process.env.REGION) as AWS_REGION;
    if (_.isEmpty(this._region)) {
      throw new AgreementError(
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
    this._client = new Ses.SESClient({
      region: this._region,
    });
  }
  private _region: AWS_REGION;
  private _client: Ses.SESClient;

  public sendEmail = async (args: { sendEmailCommandInput: Ses.SendEmailCommandInput }): Promise<Ses.SendEmailCommandOutput> => {
    logger.info('sesService.sendEmail', args);
    const command = new Ses.SendEmailCommand(args.sendEmailCommandInput);
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
