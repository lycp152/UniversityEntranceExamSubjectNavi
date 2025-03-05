# University Entrance Exam Subject Navigator

[![Go Report Card](https://goreportcard.com/badge/github.com/yourusername/UniversityEntranceExamSubjectNavi)](https://goreportcard.com/report/github.com/yourusername/UniversityEntranceExamSubjectNavi)
[![PkgGoDev](https://pkg.go.dev/badge/github.com/yourusername/UniversityEntranceExamSubjectNavi)](https://pkg.go.dev/github.com/yourusername/UniversityEntranceExamSubjectNavi)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](../LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-green.svg)](./SECURITY.md)

[English](./docs/README_en.md) | [日本語](../README.md)

## Overview

A web application that efficiently supports university entrance exam subject selection, guiding students to optimal subject choices based on their aspirations and data-driven insights.

### Key Features

- 🎯 Efficient search for entrance exam subjects
- 📊 Visual display of scores by faculty and department
- 🔄 Comparative analysis by exam type
- 📱 Responsive design for various devices
- 🔒 Security measures for educational institutions

## Features

- Search by entrance exam subject ratio

  - Filtering by subject score ratio
  - Cross-comparison of universities, faculties, and departments
  - Save custom search conditions

- Display of entrance exam subjects by faculty/department

  - Visual graph display
  - Highlight of year-over-year changes
  - Detailed breakdown of scores

- Early/Mid/Late Term Exam Information Management

  - Calendar display of exam dates
  - Application period reminder function
  - Requirements list by exam type

- Score Comparison by Exam Type
  - Comparison of general and special entrance exams
  - Subject importance analysis
  - Pass probability simulation

## Technology Stack

### Backend

- Go 1.22
  - High-performance concurrent processing
  - Type safety and robustness
- Echo Framework
  - Lightweight and fast routing
  - Flexible middleware extension
- GORM
  - Intuitive database operations
  - Automated migration management
- PostgreSQL
  - Reliable data persistence
  - Complex query optimization

### Frontend

- Next.js
  - Fast initial display with SSR
  - Optimized image processing
- TypeScript
  - Improved development efficiency with type safety
  - Code quality maintenance
- TailwindCSS
  - Customizable design
  - Rapid development cycle

### Infrastructure

- Docker
  - Environment consistency
  - Scalable deployment
- Docker Compose
  - Unified development environment
  - Simplified service integration
- Nginx
  - High-speed reverse proxy
  - Secure communication control

## Development Environment Setup

### Prerequisites

- Go 1.22 or higher
- Node.js 18 or higher
- Docker & Docker Compose
- Make
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/UniversityEntranceExamSubjectNavi.git
cd UniversityEntranceExamSubjectNavi

# Set environment variables
make setup

# Install dependencies
make install

# Setup database
make db-setup

# Start application
make dev
```

For detailed instructions, refer to the [Development Environment Setup Guide](docs/development/setup.md).

## Troubleshooting

### Common Issues and Solutions

1. Database Connection Errors

   ```bash
   # Check database container status
   make db-status

   # Restart database
   make db-restart
   ```

2. Migration Errors

   ```bash
   # Check migration status
   make migrate-status

   # Reset migrations
   make migrate-reset
   ```

3. Development Server Issues

   ```bash
   # Check logs
   make logs

   # Complete development environment reset
   make clean dev
   ```

### Debug Mode

```bash
# Start in debug mode
make dev-debug

# Detailed log output
make dev-verbose
```

## Security

- Report vulnerabilities according to our [Security Policy](./SECURITY.md)
- Regular security audits are conducted
- Special attention to handling educational data

## Performance Optimization

- Frontend Optimization

  - Lazy loading of images
  - Code splitting
  - Caching strategies

- Backend Optimization
  - Query optimization
  - Cache utilization
  - Asynchronous processing

## Contribution Guidelines

1. Create an [Issue](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/issues)
2. Create a feature branch
3. Implement following coding standards
4. Create and run tests
5. Submit a pull request

For details, refer to [CONTRIBUTING.md](./docs/contributing/CONTRIBUTING.md).

## License

This software is provided under a proprietary license. See [LICENSE](../LICENSE) for details.

For educational institutions interested in using this software, please contact:

- License inquiries: license@example.com
- Pricing inquiries: sales@example.com

## Contact

- Technical Questions: [Discussions](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/discussions)
- Bug Reports: [Issues](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/issues)
- Security Related: security@example.com
- Other Inquiries: contact@example.com

## Acknowledgments

- All contributors to this project
- Educational institutions providing feedback
- The open source community
