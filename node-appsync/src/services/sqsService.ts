import logger from 'utils/logger';
import Sqs from '@aws-sdk/client-sqs';
import _ from 'lodash';
import { ArgumentError, AWSSDKError } from 'exceptions/index';
import { AWS_REGION } from 'types/index';

export default class {
  constructor(args?: { region?: AWS_REGION }) {
    this._region = (args?.region || process.env.REGION) as AWS_REGION;
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
    this._client = new Sqs.SQSClient({
      region: this._region,
    });
  }
  private _region: AWS_REGION;
  private _client: Sqs.SQSClient;

  /**
   * Delete a message in SQS
   * @param queueEndpoint Queue endpoint to delete
   * @param receiptHandle receiptHandle contained in the received message
   */
  public deleteMessageFromSqs = async (args: { queueEndpoint: string; receiptHandle: string }): Promise<Sqs.DeleteMessageCommandOutput> => {
    logger.info('sqsService.deleteMessageFromSqs', args);
    const params = {
      QueueUrl: args.queueEndpoint,
      ReceiptHandle: args.receiptHandle,
    };
    const command = new Sqs.DeleteMessageCommand(params);
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

  /**
   * Send message to SQS
   * @param queueURL SQS endpoint
   * @param messagePayload Payload of the message
   * @param messageGroupId Set for FIFO queue
   * @param messageDeduplicationId Set for FIFO queue
   */
  public sendMessageToSQS = async (args: {
    queueURL: string;
    messagePayload: Record<string, unknown>;
    messageGroupId?: string;
    messageDeduplicationId?: string;
  }): Promise<Sqs.SendMessageCommandOutput> => {
    logger.info('sqsService.sendMessageToSQS', args);
    const params = {
      QueueUrl: args.queueURL,
      MessageBody: JSON.stringify(args.messagePayload),
    };
    if (args.messageGroupId || args.messageDeduplicationId) {
      if (args.messageGroupId && !args.messageDeduplicationId) throw new AWSSDKError(`When specifying messageGroupId, please specify messageDeduplicationId. [sqsService.ts]`);
      if (!args.messageGroupId && args.messageDeduplicationId) throw new AWSSDKError(`When specifying messageDeduplicationId, please specify messageGroupId. [sqsService.ts]`);
      _.assign(params, {
        MessageGroupId: args.messageGroupId,
        MessageDeduplicationId: args.messageDeduplicationId,
      });
    }
    const command = new Sqs.SendMessageCommand(params);
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
