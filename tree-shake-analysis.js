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
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
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

// Main analysis
function analyzeUnusedCode() {
  console.log('🔍 Analyzing unused code...\n');
  
  const allFiles = getAllFiles(SRC_DIR);
  const unusedFiles = [];
  const usedFiles = [];
  
  console.log(`Found ${allFiles.length} files to analyze...\n`);
  
  for (const file of allFiles) {
    const relativePath = path.relative(SRC_DIR, file);
    
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
  
  // Report results
  console.log('📊 Analysis Results:\n');
  console.log(`✅ Used files: ${usedFiles.length}`);
  console.log(`❌ Potentially unused files: ${unusedFiles.length}\n`);
  
  if (unusedFiles.length > 0) {
    console.log('🚨 Potentially unused files:');
    unusedFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log('\n💡 Note: These files might be dynamically imported or used in ways not detected by this analysis.');
  }
  
  // Analyze component usage
  console.log('\n🔧 Component Analysis:');
  const componentFiles = getAllFiles(COMPONENTS_DIR);
  const unusedComponents = [];
  
  for (const component of componentFiles) {
    const relativePath = path.relative(SRC_DIR, component);
    if (!isFileImported(component, allFiles)) {
      unusedComponents.push(relativePath);
    }
  }
  
  if (unusedComponents.length > 0) {
    console.log('\nPotentially unused components:');
    unusedComponents.forEach(component => {
      console.log(`  - ${component}`);
    });
  } else {
    console.log('✅ All components appear to be used');
  }
  
  // Analyze hooks usage
  console.log('\n🎣 Hooks Analysis:');
  const hookFiles = getAllFiles(HOOKS_DIR);
  const unusedHooks = [];
  
  for (const hook of hookFiles) {
    const relativePath = path.relative(SRC_DIR, hook);
    if (!isFileImported(hook, allFiles)) {
      unusedHooks.push(relativePath);
    }
  }
  
  if (unusedHooks.length > 0) {
    console.log('\nPotentially unused hooks:');
    unusedHooks.forEach(hook => {
      console.log(`  - ${hook}`);
    });
  } else {
    console.log('✅ All hooks appear to be used');
  }
  
  // Analyze utils usage
  console.log('\n🛠️ Utils Analysis:');
  const utilFiles = getAllFiles(UTILS_DIR);
  const unusedUtils = [];
  
  for (const util of utilFiles) {
    const relativePath = path.relative(SRC_DIR, util);
    if (!isFileImported(util, allFiles)) {
      unusedUtils.push(relativePath);
    }
  }
  
  if (unusedUtils.length > 0) {
    console.log('\nPotentially unused utilities:');
    unusedUtils.forEach(util => {
      console.log(`  - ${util}`);
    });
  } else {
    console.log('✅ All utilities appear to be used');
  }
  
  console.log('\n📝 Summary:');
  console.log(`Total files analyzed: ${allFiles.length}`);
  console.log(`Used files: ${usedFiles.length}`);
  console.log(`Potentially unused files: ${unusedFiles.length}`);
  console.log(`Unused components: ${unusedComponents.length}`);
  console.log(`Unused hooks: ${unusedHooks.length}`);
  console.log(`Unused utilities: ${unusedUtils.length}`);
}

// Run the analysis
analyzeUnusedCode(); 