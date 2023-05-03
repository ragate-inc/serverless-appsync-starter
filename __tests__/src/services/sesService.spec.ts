// @ts-nocheck
import { AWSSDKError } from 'exceptions/index';
import { AWS_REGION } from 'types/index';
import * as Ses from '@aws-sdk/client-ses';
import _ from 'lodash';
import logger from 'utils/logger';
import SesService from 'services/sesService';

jest.mock('@aws-sdk/client-ses');

describe('SesService', () => {
  let instance: SesService;
  let SESClient: jest.Mocked<Ses.SESClient>;

  beforeEach(() => {
    SESClient = new Ses.SESClient({} as any);
    (Ses.SESClient as jest.Mock).mockImplementation(() => SESClient);
    instance = new SesService({});
  });

  describe('constructor', () => {
    it('constructs the instance', () => {
      expect(instance).toBeDefined();
    });

    it('sets _region from env REGION', () => {
      process.env.REGION = 'test-region' as AWS_REGION;
      instance = new SesService({});
      expect(instance._region).toBe('test-region');
    });

    it('sets _region from args', () => {
      process.env.REGION = 'test-region' as AWS_REGION;
      instance = new SesService({ region: 'other-region' as AWS_REGION });
      expect(instance._region).toBe('other-region');
    });
  });

  describe('sendEmail', () => {
    it('sends an email', async () => {
      const sendEmailCommandInput = {
        Destination: {
          ToAddresses: ['test@example.com'],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'utf-8',
              Data: 'hello world',
            },
          },
          Subject: {
            Charset: 'utf-8',
            Data: 'test email',
          },
        },
        Source: 'test@example.com',
      } as Ses.SendEmailCommandInput;
      const sendEmailCommandOutput = {
        MessageId: 'test-message-id',
      } as Ses.SendEmailCommandOutput;
      SESClient.send = jest.fn().mockResolvedValue(sendEmailCommandOutput);
      logger.info = jest.fn();
      const result = await instance.sendEmail({ sendEmailCommandInput });
      expect(result).toBe(sendEmailCommandOutput);
      expect(logger.info).toHaveBeenCalledWith('sesService.sendEmail', expect.objectContaining({ sendEmailCommandInput }));
      expect(SESClient.send).toHaveBeenCalledWith(expect.any(Ses.SendEmailCommand));
    });

    it('throws AWSSDKError on SESClient.send failure', async () => {
      const sendEmailCommandInput = {
        Destination: {
          ToAddresses: ['test@example.com'],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'utf-8',
              Data: 'hello world',
            },
          },
          Subject: {
            Charset: 'utf-8',
            Data: 'test email',
          },
        },
        Source: 'test@example.com',
      } as Ses.SendEmailCommandInput;
      const err = new Error('test error');
      SESClient.send = jest.fn().mockRejectedValue(err);
      logger.info = jest.fn();
      expect(instance.sendEmail({ sendEmailCommandInput })).rejects.toThrowError(AWSSDKError);
      expect(logger.info).toHaveBeenCalledWith('sesService.sendEmail', expect.objectContaining({ sendEmailCommandInput }));
      expect(SESClient.send).toHaveBeenCalledWith(expect.any(Ses.SendEmailCommand));
    });
  });
});
