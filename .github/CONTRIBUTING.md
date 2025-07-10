# Contributing to Niby Discord Bot

Thank you for your interest in contributing to the Niby Discord Bot! We welcome contributions from the community and are grateful for any help you can provide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to our [Discord Server](https://discord.gg/MBPsvcphGf).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your feature or bug fix
4. **Make your changes**
5. **Test your changes** thoroughly
6. **Submit a pull request**

## How to Contribute

### 🐛 Reporting Bugs

- Use the bug report template when creating an issue
- Include detailed steps to reproduce the bug
- Provide error logs and environment details
- Search existing issues before creating a new one

### ✨ Suggesting Features

- Use the feature request template
- Explain the problem your feature would solve
- Provide detailed description of the proposed solution
- Consider if this feature fits the project's scope

### 💻 Code Contributions

We welcome contributions in the following areas:

- **New Commands**: Add useful commands to existing categories
- **Bug Fixes**: Fix existing issues or improve stability
- **Performance Improvements**: Optimize code for better performance
- **Documentation**: Improve or expand documentation
- **Translations**: Add support for new languages
- **Dashboard Features**: Enhance the web dashboard
- **Music System**: Improve the music functionality

## Development Setup

### Prerequisites

- Node.js 18.x.x or higher
- MongoDB database
- Redis server
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/dewstouh/niby-discord-bot.git
   cd niby-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy environment file**
   ```bash
   cp .env-EXAMPLE .env
   ```

4. **Configure environment variables**
   - Edit `.env` with your bot token and database URLs
   - See README.md for detailed configuration guide

5. **Build and start development**
   ```bash
   npm run dev
   ```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Follow existing patterns** in the codebase
- **Add proper type definitions** for new interfaces
- **Use ESLint rules** defined in the project

### Code Style

- Use **2 spaces** for indentation
- Use **semicolons** at the end of statements
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and interfaces
- Keep lines under **100 characters** when possible

### File Organization

- **Commands**: Place in appropriate category folders under `/src/commands/`
- **Components**: Organize by type under `/src/components/`
- **Types**: Add to appropriate files in `/src/typings/`
- **Utils**: Place utility functions in `/src/utils/`

### Naming Conventions

- **Files**: Use kebab-case for file names
- **Commands**: Use descriptive names that indicate functionality
- **Functions**: Use descriptive verbs (e.g., `getUserData`, `createEmbed`)
- **Variables**: Use descriptive nouns (e.g., `userData`, `guildConfig`)

## Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Ensure code follows** project standards
3. **Update documentation** if needed
4. **Add/update tests** for new functionality
5. **Check for merge conflicts**

### PR Requirements

- **Clear title** describing the change
- **Detailed description** of what was changed and why
- **Reference related issues** using `#issue-number`
- **Include screenshots** for UI changes
- **Add breaking change notes** if applicable

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** from project maintainer
5. **Merge** into main branch

## Issue Guidelines

### Good Issues Include

- **Clear, descriptive title**
- **Detailed description** of the problem or request
- **Steps to reproduce** (for bugs)
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Relevant logs or screenshots**

### Labels We Use

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## Community

### Getting Help

- **Discord Server**: [Join our community](https://discord.gg/MBPsvcphGf)
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the README.md first

### Recognition

Contributors are recognized in several ways:

- **Contributors list** in the repository
- **Special role** in our Discord server
- **Mention in release notes** for significant contributions

## Development Guidelines

### Adding New Commands

1. **Choose appropriate category** or create a new one
2. **Follow existing command structure**
3. **Add proper permissions** and error handling
4. **Include cooldowns** where appropriate
5. **Add multilingual support** using the i18n system
6. **Test thoroughly** in different scenarios

### Database Changes

1. **Update schemas** in `/src/database/schemas/`
2. **Add migration scripts** if needed
3. **Update TypeScript types**
4. **Test with both cached and non-cached data**

### Dashboard Features

1. **Follow existing UI patterns**
2. **Ensure responsive design**
3. **Add proper authentication checks**
4. **Update both frontend and backend**

## Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort in improving the Niby Discord Bot!

---

For more information, visit our [Discord Server](https://discord.gg/MBPsvcphGf) or check out the [README.md](README.md) for detailed setup instructions.
