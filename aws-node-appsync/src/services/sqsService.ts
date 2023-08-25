import logger from 'utils/logger';
import * as Sqs from '@aws-sdk/client-sqs';
import _ from 'lodash';
import { AWSSDKError, BadRequestError } from 'exceptions/index';
import { AWS_REGION, AwsSdkServiceAbstract } from 'types/index';

export default class extends AwsSdkServiceAbstract {
  constructor(args?: { region?: AWS_REGION }) {
    super(args);
    this._client = new Sqs.SQSClient({
      region: this.region,
    });
  }

  private readonly _client: Sqs.SQSClient;

  private get client(): Sqs.SQSClient {
    return this._client;
  }

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
      return await this.client.send(command);
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        err,
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
      if (args.messageGroupId && !args.messageDeduplicationId) throw new BadRequestError(`When specifying messageGroupId, please specify messageDeduplicationId. [sqsService.ts]`);
      if (!args.messageGroupId && args.messageDeduplicationId) throw new BadRequestError(`When specifying messageDeduplicationId, please specify messageGroupId. [sqsService.ts]`);
      _.assign(params, {
        MessageGroupId: args.messageGroupId,
        MessageDeduplicationId: args.messageDeduplicationId,
      });
    }
    const command = new Sqs.SendMessageCommand(params);
    try {
      return await this.client.send(command);
    } catch (e) {
      const err: Error = e as Error;
      throw new AWSSDKError(
        err,
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
