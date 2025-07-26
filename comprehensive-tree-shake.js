#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const HOOKS_DIR = path.join(SRC_DIR, 'hooks');
const UTILS_DIR = path.join(SRC_DIR, 'utils');

// File extensions to analyze
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Get all files recursively
function getAllFiles(dir, extensions = EXTENSIONS) {
  const files = [];
  
  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Extract imports from a file
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match import statements
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    return [];
  }
}

// Check if a file is imported anywhere
function isFileImported(filePath, allFiles) {
  const relativePath = path.relative(SRC_DIR, filePath);
  const importPath = relativePath.replace(/\.(tsx?|jsx?)$/, '');
  
  for (const file of allFiles) {
    if (file === filePath) continue;
    
    const imports = extractImports(file);
    for (const importStatement of imports) {
      if (importStatement.includes(importPath) || importStatement.includes(relativePath)) {
        return true;
      }
    }
  }
  
  return false;
}

// Analyze file sizes
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main analysis
function comprehensiveAnalysis() {
  console.log('🔍 Comprehensive Tree-Shaking Analysis\n');
  console.log('=' .repeat(60));
  
  const allFiles = getAllFiles(SRC_DIR);
  const unusedFiles = [];
  const usedFiles = [];
  const fileSizes = {};
  
  console.log(`📁 Found ${allFiles.length} files to analyze...\n`);
  
  // Analyze file usage and sizes
  for (const file of allFiles) {
    const relativePath = path.relative(SRC_DIR, file);
    const size = getFileSize(file);
    fileSizes[relativePath] = size;
    
    // Skip index files and main entry points
    if (file.includes('main.tsx') || file.includes('App.tsx') || file.includes('index.tsx')) {
      usedFiles.push(relativePath);
      continue;
    }
    
    if (isFileImported(file, allFiles)) {
      usedFiles.push(relativePath);
    } else {
      unusedFiles.push(relativePath);
    }
  }
  
  // Calculate total sizes
  const totalSize = Object.values(fileSizes).reduce((a, b) => a + b, 0);
  const usedSize = usedFiles.reduce((sum, file) => sum + (fileSizes[file] || 0), 0);
  const unusedSize = unusedFiles.reduce((sum, file) => sum + (fileSizes[file] || 0), 0);
  
  // Report results
  console.log('📊 Overall Analysis:');
  console.log(`✅ Used files: ${usedFiles.length} (${formatBytes(usedSize)})`);
  console.log(`❌ Potentially unused files: ${unusedFiles.length} (${formatBytes(unusedSize)})`);
  console.log(`📦 Total project size: ${formatBytes(totalSize)}`);
  console.log(`💾 Potential savings: ${formatBytes(unusedSize)} (${((unusedSize / totalSize) * 100).toFixed(1)}%)\n`);
  
  // Analyze by category
  const categories = {
    components: { dir: COMPONENTS_DIR, name: 'Components' },
    pages: { dir: PAGES_DIR, name: 'Pages' },
    hooks: { dir: HOOKS_DIR, name: 'Hooks' },
    utils: { dir: UTILS_DIR, name: 'Utilities' }
  };
  
  for (const [key, category] of Object.entries(categories)) {
    const categoryFiles = getAllFiles(category.dir);
    const unusedInCategory = [];
    let categorySize = 0;
    
    for (const file of categoryFiles) {
      const relativePath = path.relative(SRC_DIR, file);
      if (!isFileImported(file, allFiles)) {
        unusedInCategory.push(relativePath);
      }
      categorySize += fileSizes[relativePath] || 0;
    }
    
    console.log(`🔧 ${category.name} Analysis:`);
    console.log(`   Total: ${categoryFiles.length} files (${formatBytes(categorySize)})`);
    console.log(`   Unused: ${unusedInCategory.length} files`);
    
    if (unusedInCategory.length > 0) {
      console.log(`   Potential savings: ${formatBytes(unusedInCategory.reduce((sum, file) => sum + (fileSizes[file] || 0), 0))}`);
    }
    console.log('');
  }
  
  // Show largest unused files
  const largestUnused = unusedFiles
    .map(file => ({ file, size: fileSizes[file] || 0 }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  if (largestUnused.length > 0) {
    console.log('📏 Largest Potentially Unused Files:');
    largestUnused.forEach(({ file, size }) => {
      console.log(`   ${formatBytes(size).padStart(8)} - ${file}`);
    });
    console.log('');
  }
  
  // Recommendations
  console.log('💡 Recommendations:');
  console.log('1. Review the largest unused files first for maximum impact');
  console.log('2. Check for dynamic imports that might not be detected');
  console.log('3. Verify components are not used in routing or lazy loading');
  console.log('4. Consider removing unused UI components to reduce bundle size');
  console.log('5. Remove unused utilities and hooks to clean up the codebase');
  console.log('');
  
  // Generate removal script
  console.log('🚀 Quick Removal Script:');
  console.log('Run the following commands to remove unused files:');
  console.log('');
  
  const safeToRemove = unusedFiles.filter(file => 
    !file.includes('__tests__') && 
    !file.includes('types/') &&
    !file.includes('vite-env.d.ts')
  );
  
  if (safeToRemove.length > 0) {
    console.log('# Remove unused files (review first!):');
    safeToRemove.forEach(file => {
      console.log(`rm "${file}"`);
    });
    console.log('');
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: allFiles.length,
      usedFiles: usedFiles.length,
      unusedFiles: unusedFiles.length,
      totalSize: totalSize,
      usedSize: usedSize,
      unusedSize: unusedSize,
      potentialSavings: ((unusedSize / totalSize) * 100).toFixed(1)
    },
    unusedFiles: unusedFiles.map(file => ({
      file,
      size: fileSizes[file] || 0,
      sizeFormatted: formatBytes(fileSizes[file] || 0)
    })),
    largestUnused: largestUnused
  };
  
  fs.writeFileSync('tree-shake-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to: tree-shake-report.json');
}

// Run the analysis
comprehensiveAnalysis(); 