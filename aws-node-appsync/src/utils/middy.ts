import middy from '@middy/core';
import logger from 'utils/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import errorCatch from 'middlewares/middy/errorCatch';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default middy().use(injectLambdaContext(logger)).use(errorCatch());
