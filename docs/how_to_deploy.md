# Overview

This section describes matters related to the implementation of deployments in this project.

# How to Deploy

```bash
# for dev
yarn deploy:ap-northeast-1:dev
# for stg
yarn deploy:ap-northeast-1:stg
# for prd
yarn deploy:ap-northeast-1:prd
```

## Automatically deployed by CI.CD

See buildspec.yml in the root directory for detailed execution details.
