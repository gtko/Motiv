#!/usr/bin/env node

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration des tailles de favicon
const faviconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

// Tailles pour le fichier .ico (multi-size)
const icoSizes = [16, 32, 48];

async function generateFavicons() {
  console.log('🎨 Génération des favicons à partir du logo...\n');

  const logoPath = join(projectRoot, 'public', 'assets', 'logo-motiv.png');
  const outputDir = join(projectRoot, 'public');

  // Vérifier que le logo existe
  if (!existsSync(logoPath)) {
    console.error('❌ Erreur: Le logo logo-motiv.png n\'existe pas dans public/assets/');
    process.exit(1);
  }

  try {
    // Générer les différentes tailles de PNG
    console.log('📱 Génération des fichiers PNG...');
    for (const { name, size } of faviconSizes) {
      const outputPath = join(outputDir, name);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✅ ${name} (${size}x${size})`);
    }

    // Générer le favicon.ico multi-taille
    console.log('\n🖼️  Génération du favicon.ico...');
    const icoBuffers = [];
    
    for (const size of icoSizes) {
      const buffer = await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      icoBuffers.push({ size, buffer });
    }

    // Créer un favicon.ico simple avec la taille 32x32
    const favicon32Buffer = await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    writeFileSync(join(outputDir, 'favicon.ico'), favicon32Buffer);
    console.log('  ✅ favicon.ico');

    // Générer le favicon.svg (version vectorielle)
    console.log('\n🎯 Génération du favicon.svg...');
    
    // Créer un SVG simple avec le logo en base64
    const logoBuffer = readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    
    const svgContent = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${logoBase64}" x="0" y="0" width="32" height="32"/>
</svg>`;
    
    writeFileSync(join(outputDir, 'favicon.svg'), svgContent);
    console.log('  ✅ favicon.svg');

    // Générer le site.webmanifest
    console.log('\n📋 Génération du site.webmanifest...');
    
    const webmanifest = {
      name: "Motiv",
      short_name: "Motiv",
      description: "Plateforme de gamification pour équipes créatives",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#22c55e",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    
    writeFileSync(
      join(outputDir, 'site.webmanifest'), 
      JSON.stringify(webmanifest, null, 2)
    );
    console.log('  ✅ site.webmanifest');

    console.log('\n🎉 Génération des favicons terminée avec succès !');
    console.log('\n📝 Fichiers générés :');
    console.log('  • favicon.ico');
    console.log('  • favicon.svg');
    console.log('  • favicon-16x16.png');
    console.log('  • favicon-32x32.png');
    console.log('  • apple-touch-icon.png');
    console.log('  • android-chrome-192x192.png');
    console.log('  • android-chrome-512x512.png');
    console.log('  • site.webmanifest');
    
    console.log('\n💡 N\'oubliez pas de mettre à jour Layout.astro avec les nouvelles meta tags !');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des favicons:', error);
    process.exit(1);
  }
}

// Lancer la génération
generateFavicons();