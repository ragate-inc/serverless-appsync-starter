// @ts-nocheck
import AppsyncIdentityService from 'services/appsyncIdentityService';
import { AppSyncIdentity } from 'aws-lambda';

describe('AppsyncIdentityService', () => {
  it('should initialize correctly with identity data', () => {
    const identity: AppSyncIdentity = {
      claims: {
        'cognito:groups': ['group1', 'group2'],
        sub: 'sub1234',
        email: 'test@example.com',
      },
      sub: 'sub1234',
      issuer: 'issuer',
    };
    const AppsyncIdentityServiceInstance = new AppsyncIdentityService(identity);
    expect(AppsyncIdentityServiceInstance.sub).toEqual('sub1234');
    expect(AppsyncIdentityServiceInstance.email).toEqual('test@example.com');
    expect(AppsyncIdentityServiceInstance.userGroups).toEqual(['group1', 'group2']);
  });

  it('should initialize correctly with identity data without email', () => {
    const identity: AppSyncIdentity = {
      claims: {
        'cognito:groups': ['group1', 'group2'],
        sub: 'sub1234',
      },
      sub: 'sub1234',
      issuer: 'issuer',
    };
    const AppsyncIdentityServiceInstance = new AppsyncIdentityService(identity);
    expect(AppsyncIdentityServiceInstance.sub).toEqual('sub1234');
    expect(AppsyncIdentityServiceInstance.email).toBeUndefined();
    expect(AppsyncIdentityServiceInstance.userGroups).toEqual(['group1', 'group2']);
  });

  it('should initialize correctly with identity data without groups and email', () => {
    const identity: AppSyncIdentity = {
      claims: {
        sub: 'sub1234',
      },
      sub: 'sub1234',
      issuer: 'issuer',
    };
    const AppsyncIdentityServiceInstance = new AppsyncIdentityService(identity);
    expect(AppsyncIdentityServiceInstance.sub).toEqual('sub1234');
    expect(AppsyncIdentityServiceInstance.email).toBeUndefined();
    expect(AppsyncIdentityServiceInstance.userGroups).toEqual([]);
  });
});
