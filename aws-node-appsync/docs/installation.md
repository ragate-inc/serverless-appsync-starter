# Installation

## install nodejs LTS

```bash
nvm install 18
nvm use 18
Now using node v18.x.x (npm v8.6.0)

node -v
> 18.x.x
```

## install npm packages

If the yarn command is not yet installed

```bash
npm install -g yarn
```

Install packages.

```bash
yarn
```

# Does not provide local server environment startup

Serverless offline, local stacks, etc. are not implemented.
See [here](./how_to_unit_test.md) for the reason.

# Next Steps

- [How to deploy](./how_to_deploy.md)
- [How to Unit test](./how_to_unit_test.md)
