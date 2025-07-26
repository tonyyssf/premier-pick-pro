#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size...\n');

// Run bundle analyzer
try {
  console.log('📊 Generating bundle analysis...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n📈 Bundle analysis complete!');
  console.log('📁 Check the dist/ folder for the built files');
  
  // Analyze bundle sizes
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    let totalSize = 0;
    
    console.log('\n📦 Bundle breakdown:');
    console.log('─'.repeat(50));
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      
      console.log(`${file.padEnd(30)} ${sizeKB} KB`);
    });
    
    console.log('─'.repeat(50));
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Recommendations
    console.log('\n💡 Optimization recommendations:');
    
    if (totalSize > 2 * 1024 * 1024) { // 2MB
      console.log('⚠️  Bundle is large (>2MB). Consider:');
      console.log('   • Code splitting for routes');
      console.log('   • Lazy loading heavy components');
      console.log('   • Tree shaking unused code');
      console.log('   • Optimizing images and assets');
    }
    
    if (totalSize > 1 * 1024 * 1024) { // 1MB
      console.log('📝 Bundle is medium-sized (>1MB). Consider:');
      console.log('   • Analyzing dependencies with webpack-bundle-analyzer');
      console.log('   • Replacing heavy libraries with lighter alternatives');
      console.log('   • Implementing dynamic imports');
    }
    
    console.log('\n✅ Bundle analysis complete!');
  }
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
} 