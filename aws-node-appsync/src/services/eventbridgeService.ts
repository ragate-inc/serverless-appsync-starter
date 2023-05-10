import logger from 'utils/logger';
import * as EventBridge from '@aws-sdk/client-eventbridge';
import _ from 'lodash';
import { AWSSDKError } from 'exceptions/index';
import moment from 'moment-timezone';
import { AWS_REGION, AwsSdkServiceAbstract } from 'types/index';

export default class extends AwsSdkServiceAbstract {
  constructor(args?: { region?: AWS_REGION }) {
    super(args);
    this._client = new EventBridge.EventBridgeClient({
      region: this.region,
    });
  }
  private readonly _client: EventBridge.EventBridgeClient;

  private get client(): EventBridge.EventBridgeClient {
    return this._client;
  }

  /**
   * Convert Date to EventBridge's Cron notation.
   * @param {Date} date
   */
  public convertCronExpression = (date: Date): string => moment(date).utc().format('cron(m H D M ? Y)');

  /**
   * Delete all EventBridgeRule and EventBridgeTargets of EventBridgeRule
   * @description Delete all EventBridge rules and registered targets
   * @param ruleName Name of EventBridge rule to be deleted
   */
  public deleteRuleByRuleName = async (args: { ruleName: string }): Promise<EventBridge.DeleteRuleCommandOutput> => {
    logger.info('eventbridgeService.deleteRuleByRuleName', args);
    // The target must be deleted before the rule deletion or an error will occur.
    await this.removeAllTargetsByRuleName({ ruleName: args.ruleName });
    const params: EventBridge.DeleteRuleCommandInput = {
      Name: args.ruleName,
    };
    const command = new EventBridge.DeleteRuleCommand(params);
    try {
      return this.client.send(command);
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

  public listTargetsByRule = (args: { ruleName: string; nextToken: string }): Promise<EventBridge.ListTargetsByRuleCommandOutput> => {
    logger.info('eventbridgeService.listTargetsByRule', args);
    const params: EventBridge.ListTargetsByRuleCommandInput = {
      Rule: args.ruleName,
      NextToken: args.nextToken,
      Limit: 100,
    };
    const command = new EventBridge.ListTargetsByRuleCommand(params);
    try {
      return this.client.send(command);
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

  public removeTargetsByIds = (args: { ruleName: string; targetIds: Array<string> }): Promise<EventBridge.RemoveTargetsCommandOutput> => {
    logger.info('eventbridgeService.removeTargetsByIds', args);
    const params: EventBridge.RemoveTargetsCommandInput = {
      Rule: args.ruleName,
      Ids: args.targetIds,
    };
    const command = new EventBridge.RemoveTargetsCommand(params);
    try {
      return this.client.send(command);
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
   * Delete all EventBridgeTargets associated with an EventBridgeRule
   * @param ruleName Name of the EventBridge rule to which the EventBridgeTargets to be deleted belong.
   */
  public removeAllTargetsByRuleName = async (args: { ruleName: string }): Promise<void> => {
    logger.info('eventbridgeService.removeAllTargetsByRuleName', args);
    const { ruleName } = args;
    const _run = async (nextToken?: string): Promise<void> => {
      const { Targets, NextToken } = await this.listTargetsByRule({
        ruleName,
        nextToken: nextToken || '',
      });
      if (Targets) {
        const targetIds: string[] = _.map(Targets)
          .map((target) => target.Id)
          .filter((id) => !_.isEmpty(id)) as string[];
        await this.removeTargetsByIds({
          ruleName,
          targetIds,
        });
      }
      if (typeof NextToken === 'string' && NextToken !== '') return _run(NextToken);
      return;
    };
    return await _run();
  };
}
