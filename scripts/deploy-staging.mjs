#!/usr/bin/env node

/**
 * Findamine Staging Deployment Script
 * This script deploys the application to the staging environment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function main() {
  log('🚀 Findamine Staging Deployment', 'bright');
  log('This script will deploy your application to the staging environment.\n', 'reset');

  // Check if we're in the right directory
  if (!existsSync('docker-compose.staging.yml')) {
    logError('docker-compose.staging.yml not found. Please run this script from the project root.');
    process.exit(1);
  }

  // Step 1: Build the applications
  logStep('1', 'Building applications...');
  
  if (!runCommand('pnpm build', 'Applications built')) {
    logError('Build failed. Please fix the build errors before deploying.');
    process.exit(1);
  }

  // Step 2: Build Docker images
  logStep('2', 'Building Docker images...');
  
  if (!runCommand('docker-compose -f docker-compose.staging.yml build', 'Docker images built')) {
    logError('Docker build failed.');
    process.exit(1);
  }

  // Step 3: Stop existing containers
  logStep('3', 'Stopping existing containers...');
  
  runCommand('docker-compose -f docker-compose.staging.yml down', 'Existing containers stopped');

  // Step 4: Start staging environment
  logStep('4', 'Starting staging environment...');
  
  if (!runCommand('docker-compose -f docker-compose.staging.yml up -d', 'Staging environment started')) {
    logError('Failed to start staging environment.');
    process.exit(1);
  }

  // Step 5: Wait for services to be ready
  logStep('5', 'Waiting for services to be ready...');
  
  log('Waiting for database to be ready...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

  // Step 6: Run database migrations
  logStep('6', 'Running database migrations...');
  
  if (!runCommand('docker exec findamine-staging-api npx prisma migrate deploy', 'Database migrations completed')) {
    logWarning('Database migrations failed. You may need to run them manually.');
  }

  // Step 7: Verify deployment
  logStep('7', 'Verifying deployment...');
  
  log('Checking service status...', 'yellow');
  execSync('docker-compose -f docker-compose.staging.yml ps', { stdio: 'inherit' });

  log('\n🎉 Staging deployment completed successfully!', 'green');
  
  log('\n📋 Service URLs:', 'bright');
  log('🌐 Web App: http://localhost:3001', 'cyan');
  log('🔧 API: http://localhost:4001', 'cyan');
  log('🗄️ Database: localhost:5433', 'cyan');
  
  log('\n📚 Useful commands:', 'bright');
  log('  View logs: docker-compose -f docker-compose.staging.yml logs -f', 'cyan');
  log('  Stop services: docker-compose -f docker-compose.staging.yml down', 'cyan');
  log('  Restart services: docker-compose -f docker-compose.staging.yml restart', 'cyan');
  
  log('\n🔍 Next steps:', 'bright');
  log('1. Test the staging environment', 'cyan');
  log('2. Verify all features work correctly', 'cyan');
  log('3. Run your test suite against staging', 'cyan');
  log('4. Deploy to production when ready', 'cyan');
}

main().catch(error => {
  logError('Deployment failed with error:');
  console.error(error);
  process.exit(1);
});
