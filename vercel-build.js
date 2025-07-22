const { execSync } = require('child_process');

console.log('🚀 Starting Vite build for Vercel...');

async function runBuild() {
  try {
    // Set NODE_ENV to production if not set
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Run Prisma generate
    console.log('🔧 Running Prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run database migrations if DATABASE_URL is set
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
    
    // Run Vite build
    console.log('🏗️  Building application with Vite...');
    execSync('npx vite build', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

runBuild();
