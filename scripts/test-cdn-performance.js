#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🌐 CDN Performance Testing\n');

// CDN regions to test
const CDN_REGIONS = [
  { name: 'US East (N. Virginia)', url: 'https://cdn.plpe.com/us-east-1/ping' },
  { name: 'US West (Oregon)', url: 'https://cdn.plpe.com/us-west-2/ping' },
  { name: 'Europe (Ireland)', url: 'https://cdn.plpe.com/eu-west-1/ping' },
  { name: 'Asia Pacific (Singapore)', url: 'https://cdn.plpe.com/ap-southeast-1/ping' },
  { name: 'South America (São Paulo)', url: 'https://cdn.plpe.com/sa-east-1/ping' },
];

// Test configuration
const TEST_CONFIG = {
  iterations: 5,
  timeout: 10000,
  concurrent: true,
};

// Performance test result
class PerformanceResult {
  constructor(region, url) {
    this.region = region;
    this.url = url;
    this.latencies = [];
    this.throughputs = [];
    this.errors = 0;
    this.successes = 0;
  }

  addLatency(latency) {
    this.latencies.push(latency);
  }

  addThroughput(throughput) {
    this.throughputs.push(throughput);
  }

  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    return this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  getAverageThroughput() {
    if (this.throughputs.length === 0) return 0;
    return this.throughputs.reduce((a, b) => a + b, 0) / this.throughputs.length;
  }

  getMinLatency() {
    return Math.min(...this.latencies);
  }

  getMaxLatency() {
    return Math.max(...this.latencies);
  }

  getSuccessRate() {
    const total = this.successes + this.errors;
    return total === 0 ? 0 : (this.successes / total) * 100;
  }

  getStatus() {
    const avgLatency = this.getAverageLatency();
    if (avgLatency < 50) return 'excellent';
    if (avgLatency < 100) return 'good';
    if (avgLatency < 200) return 'fair';
    return 'poor';
  }
}

// Make HTTP request and measure performance
function makeRequest(url, timeout = TEST_CONFIG.timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, { timeout }, (res) => {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const throughput = data.length / (latency / 1000); // bytes per second
        resolve({
          latency,
          throughput,
          statusCode: res.statusCode,
          headers: res.headers,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test single region
async function testRegion(region, iterations = TEST_CONFIG.iterations) {
  console.log(`🔍 Testing ${region.name}...`);
  
  const result = new PerformanceResult(region.name, region.url);
  
  for (let i = 0; i < iterations; i++) {
    try {
      const response = await makeRequest(region.url);
      result.addLatency(response.latency);
      result.addThroughput(response.throughput);
      result.successes++;
      
      process.stdout.write('.');
    } catch (error) {
      result.errors++;
      process.stdout.write('x');
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(); // New line after dots
  return result;
}

// Test all regions
async function testAllRegions() {
  console.log('🚀 Starting CDN performance tests...\n');
  
  const results = [];
  
  if (TEST_CONFIG.concurrent) {
    // Test all regions concurrently
    const promises = CDN_REGIONS.map(region => testRegion(region));
    const regionResults = await Promise.allSettled(promises);
    
    regionResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`❌ Failed to test ${CDN_REGIONS[index].name}:`, result.reason.message);
      }
    });
  } else {
    // Test regions sequentially
    for (const region of CDN_REGIONS) {
      try {
        const result = await testRegion(region);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to test ${region.name}:`, error.message);
      }
    }
  }
  
  return results;
}

// Generate performance report
function generateReport(results) {
  console.log('\n📊 CDN Performance Report');
  console.log('─'.repeat(80));
  
  // Sort by average latency
  results.sort((a, b) => a.getAverageLatency() - b.getAverageLatency());
  
  console.log('Rank | Region                    | Avg Latency | Min-Max Latency | Success Rate | Status');
  console.log('─────|───────────────────────────|─────────────|─────────────────|──────────────|────────');
  
  results.forEach((result, index) => {
    const rank = index + 1;
    const region = result.region.padEnd(25);
    const avgLatency = `${result.getAverageLatency().toFixed(1)}ms`.padStart(11);
    const minMax = `${result.getMinLatency()}-${result.getMaxLatency()}ms`.padStart(15);
    const successRate = `${result.getSuccessRate().toFixed(1)}%`.padStart(12);
    const status = result.getStatus().padStart(8);
    
    console.log(`${rank.toString().padStart(4)} | ${region} | ${avgLatency} | ${minMax} | ${successRate} | ${status}`);
  });
  
  // Summary statistics
  console.log('\n📈 Summary Statistics');
  console.log('─'.repeat(40));
  
  const allLatencies = results.flatMap(r => r.latencies);
  const globalAvgLatency = allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length;
  const globalMinLatency = Math.min(...allLatencies);
  const globalMaxLatency = Math.max(...allLatencies);
  
  console.log(`Global Average Latency: ${globalAvgLatency.toFixed(1)}ms`);
  console.log(`Global Min Latency: ${globalMinLatency}ms`);
  console.log(`Global Max Latency: ${globalMaxLatency}ms`);
  console.log(`Total Tests: ${allLatencies.length}`);
  
  // Recommendations
  console.log('\n💡 Recommendations');
  console.log('─'.repeat(20));
  
  const bestRegion = results[0];
  const worstRegion = results[results.length - 1];
  
  console.log(`🏆 Best performing region: ${bestRegion.region} (${bestRegion.getAverageLatency().toFixed(1)}ms)`);
  console.log(`⚠️  Worst performing region: ${worstRegion.region} (${worstRegion.getAverageLatency().toFixed(1)}ms)`);
  
  if (worstRegion.getAverageLatency() > 200) {
    console.log('🔧 Consider optimizing or replacing slow CDN regions');
  }
  
  if (bestRegion.getAverageLatency() < 50) {
    console.log('✅ Excellent CDN performance achieved');
  }
  
  // Save detailed results
  const reportData = {
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG,
    results: results.map(r => ({
      region: r.region,
      url: r.url,
      averageLatency: r.getAverageLatency(),
      minLatency: r.getMinLatency(),
      maxLatency: r.getMaxLatency(),
      averageThroughput: r.getAverageThroughput(),
      successRate: r.getSuccessRate(),
      status: r.getStatus(),
      latencies: r.latencies,
      throughputs: r.throughputs,
      errors: r.errors,
      successes: r.successes,
    })),
    summary: {
      globalAverageLatency: globalAvgLatency,
      globalMinLatency: globalMinLatency,
      globalMaxLatency: globalMaxLatency,
      totalTests: allLatencies.length,
      bestRegion: bestRegion.region,
      worstRegion: worstRegion.region,
    }
  };
  
  const reportPath = path.join(process.cwd(), 'cdn-performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

// Main execution
async function main() {
  try {
    const results = await testAllRegions();
    
    if (results.length === 0) {
      console.log('❌ No successful tests completed');
      process.exit(1);
    }
    
    generateReport(results);
    
    console.log('\n✅ CDN performance testing complete!');
  } catch (error) {
    console.error('❌ CDN performance testing failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testAllRegions, generateReport }; 