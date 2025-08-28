#!/usr/bin/env node

/**
 * Findamine Development Setup Script
 * This script helps developers set up their local development environment
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${step}. ${description}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function runCommand(command, description) {
  try {
    log(`Running: ${command}`, 'blue');
    execSync(command, { stdio: 'inherit' });
    logSuccess(description);
    return true;
  } catch (error) {
    logError(`Failed: ${description}`);
    return false;
  }
}

function createEnvFile(path, content) {
  try {
    writeFileSync(path, content);
    logSuccess(`Created ${path}`);
    return true;
  } catch (error) {
    logError(`Failed to create ${path}`);
    return false;
  }
}

async function main() {
  log('🚀 Findamine Development Setup', 'bright');
  log('This script will help you set up your local development environment.\n', 'reset');

  // Check prerequisites
  logStep('1', 'Checking prerequisites...');
  
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (nodeMajor < 18) {
    logError(`Node.js 18+ required. Current version: ${nodeVersion}`);
    process.exit(1);
  }
  logSuccess(`Node.js version: ${nodeVersion}`);

  // Check if Docker is running
  try {
    execSync('docker --version', { stdio: 'ignore' });
    logSuccess('Docker is available');
  } catch (error) {
    logWarning('Docker not found. Please install Docker to run the database locally.');
  }

  // Check if pnpm is available
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    logSuccess('pnpm is available');
  } catch (error) {
    logWarning('pnpm not found. Installing pnpm...');
    runCommand('npm install -g pnpm', 'Installed pnpm globally');
  }

  // Install dependencies
  logStep('2', 'Installing dependencies...');
  if (!runCommand('pnpm install', 'Dependencies installed')) {
    logError('Failed to install dependencies. Please check the error above.');
    process.exit(1);
  }

  // Create environment files
  logStep('3', 'Setting up environment files...');
  
  const rootEnvContent = `# Findamine Environment Configuration
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/findamine"
JWT_SECRET="dev-jwt-secret-key-change-in-production"
NEXT_PUBLIC_API_URL=http://localhost:4000
`;

  const apiEnvContent = `# Findamine API Environment Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/findamine"
JWT_SECRET="dev-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=4000
HOST=localhost
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
COOKIE_SECRET="dev-cookie-secret-change-in-production"
BCRYPT_ROUNDS=12
LOG_LEVEL=debug
ENABLE_SWAGGER=true
`;

  const webEnvContent = `# Findamine Web App Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="dev-nextauth-secret-change-in-production"
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NODE_ENV=development
`;

  createEnvFile('.env', rootEnvContent);
  createEnvFile('services/api/.env', apiEnvContent);
  createEnvFile('apps/web/.env.local', webEnvContent);

  // Start database
  logStep('4', 'Starting database...');
  if (runCommand('docker-compose up -d', 'Database started')) {
    logSuccess('Database is running on localhost:5432');
  } else {
    logWarning('Failed to start database. Please start it manually with: docker-compose up -d');
  }

  // Run database migrations
  logStep('5', 'Setting up database...');
  if (runCommand('cd services/api && npx prisma migrate dev && npx prisma generate', 'Database migrations completed')) {
    logSuccess('Database schema is ready');
  } else {
    logWarning('Failed to run database migrations. Please run them manually.');
  }

  // Final instructions
  logStep('6', 'Setup complete!');
  log('\n🎉 Your Findamine development environment is ready!', 'green');
  
  log('\n📋 Next steps:', 'bright');
  log('1. Start the development servers:', 'cyan');
  log('   pnpm dev', 'yellow');
  
  log('\n2. Open your browser to:', 'cyan');
  log('   Web App: http://localhost:3000', 'yellow');
  log('   API: http://localhost:4000', 'yellow');
  log('   Mobile: http://localhost:8081', 'yellow');
  
  log('\n3. Create your first user account at:', 'cyan');
  log('   http://localhost:3000/register', 'yellow');
  
  log('\n📚 Useful commands:', 'bright');
  log('   pnpm dev          - Start all services', 'cyan');
  log('   pnpm build        - Build all applications', 'cyan');
  log('   pnpm test         - Run all tests', 'cyan');
  log('   pnpm lint         - Run linting', 'cyan');
  
  log('\n🔧 Troubleshooting:', 'bright');
  log('   - Check the README.md for detailed setup instructions', 'cyan');
  log('   - Check CONTRIBUTING.md for development guidelines', 'cyan');
  log('   - Open an issue on GitHub if you encounter problems', 'cyan');
  
  log('\n🚀 Happy coding!', 'bright');
}

main().catch(error => {
  logError('Setup failed with error:');
  console.error(error);
  process.exit(1);
});
