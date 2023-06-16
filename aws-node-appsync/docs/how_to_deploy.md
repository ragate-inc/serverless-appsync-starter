# Overview

This section describes matters related to the implementation of deployments in this project.

For more information on deploying the serverless framework, check the official reference. [Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/deploying/)

# How to Deploy

```bash
# for dev
yarn deploy:ap-northeast-1:dev
# for stg
yarn deploy:ap-northeast-1:stg
# for prd
yarn deploy:ap-northeast-1:prd
```

# How to Deploy Function
```bash
npx sls deploy function --function FunctionName(e.g.,CreatePost) --stage stage(e.g.,dev) --aws-profile=profile(e.g.,default)
```

## Automatically deployed by CI.CD

See buildspec.yml in the root directory for detailed execution details.

For more information on buildspec.yml file. [Build specification reference for CodeBuild](https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/build-spec-ref.html)

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 16
    commands:
      - yarn
  build:
    commands:
      - npx eslint
      - npx jest --config __test__/jest.config.js --all
      - npx sls deploy deploy:ap-northeast-1:${DEPLOY_ENV} --verbose
```

- phases.install.runtime-versions.nodejs: runtime version of nodejs
- phases.install.commands: install packages
- phases.build.commands: execute eslint, jest, sls deploy
