import _ from 'lodash';
import { AppSyncIdentity } from 'aws-lambda';

export default class {
  public sub?: string;
  public email?: string;
  public userGroups: string[];
  constructor(identity: AppSyncIdentity) {
    this.userGroups = _.get(identity, 'claims[cognito:groups]', []) as string[];
    this.sub = (_.get(identity, 'claims.sub') as unknown as string) || (_.get(identity, 'sub') as unknown as string);
    this.email = _.get(identity, 'claims.email') as unknown as string;
  }
}
