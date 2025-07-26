#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Image Optimization Script\n');

// Configuration
const config = {
  inputDir: 'public/images',
  outputDir: 'public/images/optimized',
  formats: ['webp', 'avif'],
  sizes: [320, 640, 768, 1024, 1280, 1920],
  quality: 80,
  skipExisting: true,
};

// Check if sharp is installed
function checkSharp() {
  try {
    require('sharp');
    return true;
  } catch (error) {
    return false;
  }
}

// Install sharp if not available
async function installSharp() {
  console.log('📦 Installing sharp for image optimization...');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
    console.log('✅ Sharp installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to install sharp:', error.message);
    return false;
  }
}

// Get all image files
function getImageFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (isImageFile(item)) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Check if file is an image
function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

// Create output directory structure
function createOutputDirs() {
  const dirs = [
    config.outputDir,
    path.join(config.outputDir, 'webp'),
    path.join(config.outputDir, 'avif'),
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Optimize single image
async function optimizeImage(inputPath, outputPath, format, width, quality) {
  const sharp = require('sharp');
  
  try {
    let pipeline = sharp(inputPath);
    
    if (width) {
      pipeline = pipeline.resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }
    
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    await pipeline.toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    return false;
  }
}

// Generate responsive images
async function generateResponsiveImages(inputPath) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const results = [];
  
  for (const format of config.formats) {
    for (const size of config.sizes) {
      const outputFilename = `${filename}-${size}w.${format}`;
      const outputPath = path.join(config.outputDir, format, outputFilename);
      
      // Skip if file exists and skipExisting is true
      if (config.skipExisting && fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping existing: ${outputFilename}`);
        continue;
      }
      
      console.log(`🔄 Optimizing: ${filename} -> ${outputFilename}`);
      
      const success = await optimizeImage(inputPath, outputPath, format, size, config.quality);
      
      if (success) {
        const stats = fs.statSync(outputPath);
        results.push({
          format,
          size,
          filename: outputFilename,
          sizeBytes: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
        });
      }
    }
  }
  
  return results;
}

// Generate srcset string
function generateSrcSet(filename, format) {
  return config.sizes
    .map(size => `/images/optimized/${format}/${filename}-${size}w.${format} ${size}w`)
    .join(', ');
}

// Generate picture element HTML
function generatePictureElement(filename, alt = '') {
  const webpSrcSet = generateSrcSet(filename, 'webp');
  const avifSrcSet = generateSrcSet(filename, 'avif');
  const fallbackSrc = `/images/optimized/webp/${filename}-1024w.webp`;
  
  return `<picture>
  <source type="image/avif" srcset="${avifSrcSet}">
  <source type="image/webp" srcset="${webpSrcSet}">
  <img src="${fallbackSrc}" alt="${alt}" loading="lazy">
</picture>`;
}

// Main optimization function
async function optimizeImages() {
  console.log('🔍 Scanning for images...');
  
  if (!fs.existsSync(config.inputDir)) {
    console.log(`📁 Creating input directory: ${config.inputDir}`);
    fs.mkdirSync(config.inputDir, { recursive: true });
    console.log('✅ Input directory created. Please add images and run again.');
    return;
  }
  
  const imageFiles = getImageFiles(config.inputDir);
  
  if (imageFiles.length === 0) {
    console.log('📭 No image files found in input directory');
    return;
  }
  
  console.log(`📸 Found ${imageFiles.length} image files`);
  
  // Create output directories
  createOutputDirs();
  
  // Process each image
  const allResults = [];
  const pictureElements = [];
  
  for (const imagePath of imageFiles) {
    const filename = path.basename(imagePath, path.extname(imagePath));
    console.log(`\n🖼️  Processing: ${path.basename(imagePath)}`);
    
    const results = await generateResponsiveImages(imagePath);
    allResults.push(...results);
    
    // Generate picture element
    pictureElements.push({
      filename,
      html: generatePictureElement(filename, `Description for ${filename}`),
    });
  }
  
  // Generate summary
  console.log('\n📊 Optimization Summary:');
  console.log('─'.repeat(50));
  
  const totalSize = allResults.reduce((sum, result) => sum + result.sizeBytes, 0);
  const totalSizeKB = (totalSize / 1024).toFixed(2);
  
  console.log(`Total optimized images: ${allResults.length}`);
  console.log(`Total size: ${totalSizeKB} KB`);
  
  // Group by format
  const byFormat = allResults.reduce((acc, result) => {
    if (!acc[result.format]) acc[result.format] = [];
    acc[result.format].push(result);
    return acc;
  }, {});
  
  Object.entries(byFormat).forEach(([format, results]) => {
    const formatSize = results.reduce((sum, result) => sum + result.sizeBytes, 0);
    const formatSizeKB = (formatSize / 1024).toFixed(2);
    console.log(`${format.toUpperCase()}: ${results.length} images, ${formatSizeKB} KB`);
  });
  
  // Save picture elements to file
  const pictureElementsPath = path.join(config.outputDir, 'picture-elements.html');
  const htmlContent = pictureElements.map(item => 
    `<!-- ${item.filename} -->\n${item.html}\n`
  ).join('\n');
  
  fs.writeFileSync(pictureElementsPath, htmlContent);
  console.log(`\n💾 Picture elements saved to: ${pictureElementsPath}`);
  
  // Generate usage guide
  const usageGuide = `
# Image Optimization Usage Guide

## Optimized Images Generated
- **WebP format**: ${byFormat.webp?.length || 0} images
- **AVIF format**: ${byFormat.avif?.length || 0} images
- **Total size**: ${totalSizeKB} KB

## Usage Examples

### 1. Using the OptimizedImage component:
\`\`\`tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="/images/optimized/webp/${pictureElements[0]?.filename || 'example'}-1024w.webp"
  alt="Description"
  width={1024}
  height={768}
  format="webp"
/>
\`\`\`

### 2. Using picture element (for maximum compatibility):
\`\`\`html
${pictureElements[0]?.html || '<!-- No images processed -->'}
\`\`\`

### 3. Using srcset directly:
\`\`\`html
<img 
  src="/images/optimized/webp/${pictureElements[0]?.filename || 'example'}-1024w.webp"
  srcset="${generateSrcSet(pictureElements[0]?.filename || 'example', 'webp')}"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Description"
>
\`\`\`

## File Structure
\`\`\`
public/images/optimized/
├── webp/
│   ├── image-320w.webp
│   ├── image-640w.webp
│   └── ...
└── avif/
    ├── image-320w.avif
    ├── image-640w.avif
    └── ...
\`\`\`

## Performance Benefits
- **WebP**: ~25-35% smaller than JPEG/PNG
- **AVIF**: ~50% smaller than WebP
- **Responsive**: Only loads the size needed
- **Lazy loading**: Images load as they come into view
`;

  const usageGuidePath = path.join(config.outputDir, 'USAGE.md');
  fs.writeFileSync(usageGuidePath, usageGuide);
  console.log(`📖 Usage guide saved to: ${usageGuidePath}`);
  
  console.log('\n✅ Image optimization complete!');
}

// Main execution
async function main() {
  if (!checkSharp()) {
    const installed = await installSharp();
    if (!installed) {
      console.error('❌ Cannot proceed without sharp. Please install it manually: npm install sharp');
      process.exit(1);
    }
  }
  
  try {
    await optimizeImages();
  } catch (error) {
    console.error('❌ Image optimization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { optimizeImages, generateResponsiveImages }; 