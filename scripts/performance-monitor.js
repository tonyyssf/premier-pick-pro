#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Performance Monitoring...\n');

// Performance metrics
const metrics = {
  timestamp: new Date().toISOString(),
  buildTime: 0,
  bundleSize: 0,
  chunkCount: 0,
  largestChunk: 0,
  totalAssets: 0,
};

// Start timing
const startTime = Date.now();

try {
  console.log('🔨 Building project...');
  
  // Run build
  execSync('npm run build', { stdio: 'pipe' });
  
  // Calculate build time
  metrics.buildTime = Date.now() - startTime;
  
  console.log(`✅ Build completed in ${metrics.buildTime}ms`);
  
  // Analyze bundle
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    let totalSize = 0;
    let largestFile = 0;
    let jsFiles = 0;
    let cssFiles = 0;
    let assetFiles = 0;
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      totalSize += stats.size;
      
      if (sizeKB > largestFile) {
        largestFile = sizeKB;
      }
      
      if (file.endsWith('.js')) {
        jsFiles++;
      } else if (file.endsWith('.css')) {
        cssFiles++;
      } else {
        assetFiles++;
      }
    });
    
    metrics.bundleSize = totalSize;
    metrics.chunkCount = jsFiles;
    metrics.largestChunk = largestFile;
    metrics.totalAssets = files.length;
    
    console.log('\n📦 Bundle Analysis:');
    console.log('─'.repeat(40));
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`JavaScript chunks: ${jsFiles}`);
    console.log(`CSS files: ${cssFiles}`);
    console.log(`Other assets: ${assetFiles}`);
    console.log(`Largest chunk: ${largestFile.toFixed(2)} KB`);
    console.log(`Build time: ${metrics.buildTime}ms`);
    
    // Performance recommendations
    console.log('\n💡 Performance Insights:');
    
    if (metrics.buildTime > 30000) { // 30 seconds
      console.log('⚠️  Build time is slow (>30s). Consider:');
      console.log('   • Optimizing dependencies');
      console.log('   • Using faster build tools');
      console.log('   • Implementing incremental builds');
    }
    
    if (totalSize > 2 * 1024 * 1024) { // 2MB
      console.log('⚠️  Bundle is large (>2MB). Consider:');
      console.log('   • Code splitting');
      console.log('   • Tree shaking');
      console.log('   • Lazy loading');
    }
    
    if (largestFile > 500) { // 500KB
      console.log('⚠️  Largest chunk is large (>500KB). Consider:');
      console.log('   • Splitting large components');
      console.log('   • Dynamic imports');
      console.log('   • Vendor chunk optimization');
    }
    
    // Save metrics to file
    const metricsPath = path.join(process.cwd(), 'performance-metrics.json');
    let historicalMetrics = [];
    
    if (fs.existsSync(metricsPath)) {
      try {
        historicalMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      } catch (error) {
        console.log('⚠️  Could not read existing metrics file');
      }
    }
    
    historicalMetrics.push(metrics);
    
    // Keep only last 10 entries
    if (historicalMetrics.length > 10) {
      historicalMetrics = historicalMetrics.slice(-10);
    }
    
    fs.writeFileSync(metricsPath, JSON.stringify(historicalMetrics, null, 2));
    
    console.log('\n📈 Metrics saved to performance-metrics.json');
    
    // Show trends if we have historical data
    if (historicalMetrics.length > 1) {
      console.log('\n📊 Performance Trends:');
      const recent = historicalMetrics[historicalMetrics.length - 1];
      const previous = historicalMetrics[historicalMetrics.length - 2];
      
      const buildTimeChange = ((recent.buildTime - previous.buildTime) / previous.buildTime * 100).toFixed(1);
      const bundleSizeChange = ((recent.bundleSize - previous.bundleSize) / previous.bundleSize * 100).toFixed(1);
      
      console.log(`Build time: ${buildTimeChange > 0 ? '+' : ''}${buildTimeChange}%`);
      console.log(`Bundle size: ${bundleSizeChange > 0 ? '+' : ''}${bundleSizeChange}%`);
    }
    
  } else {
    console.log('❌ Build output not found');
  }
  
} catch (error) {
  console.error('❌ Performance monitoring failed:', error.message);
  process.exit(1);
}

console.log('\n✅ Performance monitoring complete!'); 