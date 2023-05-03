import { Logger } from '@aws-lambda-powertools/logger';
import { LogLevel } from '@aws-lambda-powertools/logger/lib/types';

const logger = new Logger({
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'INFO',
  serviceName: process.env.SERVICE as string,
});

export default logger;
