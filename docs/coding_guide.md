# Overview

This section describes the coding guide and regulation matters for this project.

# VSCODE is recommended for editors

The settings for VSCODE are provided in .vscode/settings.json, and code formatting is automatically performed when the file is saved. You may use other editors, but in principle, please use editors that can automatically execute and detect code formatting and Lint.

# Use code quality improvement tools

The project uses the following tools to improve code quality

- (ESLint)[https://eslint.org/]
- (Prettier)[https://prettier.io/]

The above are available for execution of the following commands, and implementors are encouraged to perform quality checks of the implemented source code as appropriate.

```bash
# for ESLint
yarn lint

# for Prettier
yarn format
```

# How to custom huskey?

```bash
yarn husky add .husky/pre-commit "your command here"
```
