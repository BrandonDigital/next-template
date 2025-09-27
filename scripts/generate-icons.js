/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Define config directly since we can't import TypeScript in CommonJS
const config = {
  icons: {
    sizes: [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512],
    maskableSizes: [192, 512],
    appleTouchSizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
  },
};

const inputFile = path.join(__dirname, "../public/logo.png");
const outputDir = path.join(__dirname, "../public");

// Ensure the input file exists
if (!fs.existsSync(inputFile)) {
  console.error("❌ logo.png not found in public directory");
  process.exit(1);
}

// Create favicon.ico for app directory
async function createFavicon() {
  try {
    const faviconPath = path.join(__dirname, "../app/favicon.ico");
    await sharp(inputFile).resize(32, 32).png().toFile(faviconPath);
    console.log("✅ Created app/favicon.ico");
  } catch (error) {
    console.error("❌ Error creating favicon.ico:", error);
  }
}

// Create PWA icons
async function createPWAIcons() {
  const iconSizes = config.icons.sizes;

  for (const size of iconSizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(inputFile).resize(size, size).png().toFile(outputPath);
      console.log(`✅ Created icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error creating icon-${size}x${size}.png:`, error);
    }
  }
}

// Create Apple Touch Icons
async function createAppleTouchIcons() {
  const appleSizes = config.icons.appleTouchSizes;

  for (const size of appleSizes) {
    try {
      const outputPath = path.join(
        outputDir,
        `apple-touch-icon-${size}x${size}.png`
      );
      await sharp(inputFile).resize(size, size).png().toFile(outputPath);
      console.log(`✅ Created apple-touch-icon-${size}x${size}.png`);
    } catch (error) {
      console.error(
        `❌ Error creating apple-touch-icon-${size}x${size}.png:`,
        error
      );
    }
  }

  // Create default apple-touch-icon.png (180x180)
  try {
    const defaultApplePath = path.join(outputDir, "apple-touch-icon.png");
    await sharp(inputFile).resize(180, 180).png().toFile(defaultApplePath);
    console.log("✅ Created apple-touch-icon.png (180x180)");
  } catch (error) {
    console.error("❌ Error creating apple-touch-icon.png:", error);
  }
}

// Create maskable icons for PWA
async function createMaskableIcons() {
  const maskableSizes = config.icons.maskableSizes;

  for (const size of maskableSizes) {
    try {
      const outputPath = path.join(
        outputDir,
        `icon-${size}x${size}-maskable.png`
      );
      await sharp(inputFile).resize(size, size).png().toFile(outputPath);
      console.log(`✅ Created icon-${size}x${size}-maskable.png`);
    } catch (error) {
      console.error(
        `❌ Error creating icon-${size}x${size}-maskable.png:`,
        error
      );
    }
  }
}

// Main function
async function generateIcons() {
  console.log("🎨 Generating PWA icons from logo.png...\n");

  await createFavicon();
  await createPWAIcons();
  await createAppleTouchIcons();
  await createMaskableIcons();

  console.log("\n🎉 All icons generated successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your manifest.ts to use the new icon paths");
  console.log("2. Test your PWA installation");
  console.log("3. Verify icons appear correctly in different contexts");
}

// Run the script
generateIcons().catch(console.error);
