# Contributing to Blockchain Omnibus Demo

Thank you for your interest in contributing! This is an educational project demonstrating TigerBeetle integration patterns.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/blockchain-omnibus-demo.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with descriptive messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Set up TigerBeetle
npm run setup:tigerbeetle

# Build shared package
cd packages/shared && npm run build

# Start development
npm run dev
```

## Code Style

- TypeScript strict mode enabled
- Use Prettier for formatting: `npm run format`
- Follow existing code patterns
- Add types for all functions and exports

## Testing

```bash
# Run backend tests
cd packages/backend
npm test

# Add tests for new features
# Tests should be in packages/backend/tests/
```

## Pull Request Guidelines

1. **Descriptive Title**: Clearly describe what the PR does
2. **Description**: Explain why this change is needed
3. **Tests**: Add tests for new functionality
4. **Documentation**: Update README if needed
5. **Clean History**: Squash commits if necessary

## Areas for Contribution

### Features
- Additional blockchain support
- Real blockchain integration (Web3.js)
- Advanced reconciliation reports
- Transaction batching
- Multi-currency support

### Improvements
- Better error messages
- More comprehensive tests
- Performance optimizations
- UI/UX enhancements
- Documentation improvements

### Bug Fixes
- Fix any bugs you find
- Add regression tests
- Document the fix

## Questions?

Open an issue with the `question` label for any questions about:
- Architecture decisions
- TigerBeetle integration
- Testing approaches
- Feature ideas

## Code of Conduct

Be respectful, helpful, and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

