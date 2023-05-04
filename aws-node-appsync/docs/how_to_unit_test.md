# Overview

This section describes the regulations for the implementation of unit tests for this project.

# How to Unit Testing

```bash
yarn test
```

# Unit test regulations

## Tests must be able to be completed without starting the local environment.

For the purpose of automatic test execution with CI.CD and to increase efficiency during development, local environment invocation such as local stack is not permitted at all.
All communication with external parties during testing should be converted to Mock.

## No coverage measurement

No coverage measurement will be performed, as we are concerned that the purpose of the test may be to increase coverage.

## Number of test patterns

Please implement at least 3 tests for each of abnormal and normal systems.
Implement test codes as necessary at the discretion of the implementer.

## Test files may ignore ts errors.

Since there are many cases in which you dare to Throw a test, you may ignore ts error errors.
Please comment out the following at the top of the file: ````ts

```ts
// @ts-nocheck
```
