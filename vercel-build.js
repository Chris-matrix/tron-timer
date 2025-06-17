// @ts-check
/* eslint-disable */
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Define globals for browser-like environments
const getGlobalThis = () => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  return {};
};

// Initialize globalThis
const globalObj = getGlobalThis();

// Ensure process exists
if (typeof globalObj.process === 'undefined') {
  globalObj.process = {
    env: {},
    exit: (code) => { 
      const err = new Error(`Process exited with code ${code}`);
      // @ts-ignore
      err.code = code;
      throw err;
    },
    cwd: () => '/',
    platform: 'browser',
    nextTick: (fn) => setTimeout(fn, 0),
    version: 'browser',
    versions: {},
    argv: []
  };
}

// Make process available globally
// @ts-ignore - We've already defined the type in vercel-build.d.ts
const process = globalObj.process;

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
try {
  dotenv.config({ path: resolve(__dirname, '.env') });
} catch (err) {
  console.warn('Failed to load .env file:', err.message);
}

async function build() {
  console.log('🚀 Starting Vercel build process...');
  
  // Set NODE_ENV to production if not set
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  
  try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // 2. Generate Prisma Client
    console.log('🔧 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 3. Run database migrations
    if (process.env.DATABASE_URL) {
      console.log('🔄 Running database migrations...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (error) {
        console.warn('⚠️  Could not run migrations, trying db push...');
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      }
    } else {
      console.warn('⚠️  DATABASE_URL not set, skipping database setup');
    }
    
    // 4. Build the application
    console.log('🏗️  Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error);
    if (typeof process !== 'undefined' && process.exit) {
      try {
        process.exit(1);
      } catch (e) {
        // If process.exit throws, just log and continue
        console.error('Error during process exit:', e);
        throw e; // Re-throw the error after logging
      }
    }
    throw error;
  }
}

build();
