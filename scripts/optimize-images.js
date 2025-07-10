#!/usr/bin/env node

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration de compression
const compressionConfig = {
  png: {
    quality: [0.7, 0.9], // Qualité PNG (70% à 90%)
    speed: 1
  },
  jpg: {
    quality: 85, // Qualité JPEG (85%)
    progressive: true
  }
};

// Extensions supportées
const supportedExtensions = ['.png', '.jpg', '.jpeg'];

// Vérifier si --force est passé en argument
const forceOptimization = process.argv.includes('--force');

// Fonctions utilitaires
function getMD5Hash(filePath) {
  try {
    const fileBuffer = readFileSync(filePath);
    return createHash('md5').update(fileBuffer).digest('hex');
  } catch {
    return null;
  }
}

function loadOptimizationLog(logPath) {
  try {
    if (existsSync(logPath)) {
      return JSON.parse(readFileSync(logPath, 'utf8'));
    }
  } catch {
    console.log('⚠️  Log d\'optimisation corrompu, création d\'un nouveau log');
  }
  return {};
}

function saveOptimizationLog(logPath, log) {
  try {
    writeFileSync(logPath, JSON.stringify(log, null, 2));
  } catch (error) {
    console.warn('⚠️  Impossible de sauvegarder le log:', error.message);
  }
}

function isImageAlreadyOptimized(imagePath, backupPath, log, fileName) {
  // Si pas de backup, l'image n'a jamais été optimisée
  if (!existsSync(backupPath)) {
    return false;
  }

  // Si --force est utilisé, forcer la re-optimisation
  if (forceOptimization) {
    return false;
  }

  // Vérifier dans le log
  if (log[fileName]) {
    const currentHash = getMD5Hash(imagePath);
    const loggedHash = log[fileName].currentHash;
    
    // Si le hash actuel correspond au hash dans le log, l'image est déjà optimisée
    if (currentHash === loggedHash) {
      return true;
    }
  }

  return false;
}

function parseResizeInstructions(fileName) {
  // Regex pour parser les instructions de redimensionnement
  // Supporte: w200, h300, w200-h100, w200-h100-fit, w200-h100-fill
  const resizeRegex = /(?:^|-)w(\d+)(?:-h(\d+))?(?:-(fit|fill|cover))?(?=\.|$)|(?:^|-)h(\d+)(?:-(fit|fill|cover))?(?=\.|$)/g;
  
  const instructions = {
    width: null,
    height: null,
    fit: 'inside', // Par défaut : redimensionner en gardant les proportions
    hasInstructions: false
  };

  let match;
  while ((match = resizeRegex.exec(fileName)) !== null) {
    instructions.hasInstructions = true;
    
    if (match[1]) {
      // Format w200 ou w200-h100
      instructions.width = parseInt(match[1], 10);
      if (match[2]) {
        instructions.height = parseInt(match[2], 10);
      }
      if (match[3]) {
        instructions.fit = match[3] === 'fit' ? 'inside' : 
                          match[3] === 'fill' ? 'cover' : 
                          match[3] === 'cover' ? 'cover' : 'inside';
      }
    } else if (match[4]) {
      // Format h300
      instructions.height = parseInt(match[4], 10);
      if (match[5]) {
        instructions.fit = match[5] === 'fit' ? 'inside' : 
                          match[5] === 'fill' ? 'cover' : 
                          match[5] === 'cover' ? 'cover' : 'inside';
      }
    }
  }

  return instructions;
}

async function resizeImage(imagePath, instructions) {
  if (!instructions.hasInstructions) {
    return false; // Aucun redimensionnement nécessaire
  }

  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width: currentWidth, height: currentHeight } = metadata;

    // Calculer les nouvelles dimensions
    let newWidth = instructions.width;
    let newHeight = instructions.height;

    // Si seulement la largeur est spécifiée
    if (newWidth && !newHeight) {
      // Ne pas agrandir par défaut
      if (newWidth > currentWidth) {
        console.log(`    ⚠️  Largeur demandée (${newWidth}px) > actuelle (${currentWidth}px), conservation de la taille originale`);
        return false;
      }
      newHeight = Math.round((currentHeight * newWidth) / currentWidth);
    }
    
    // Si seulement la hauteur est spécifiée
    if (newHeight && !newWidth) {
      // Ne pas agrandir par défaut
      if (newHeight > currentHeight) {
        console.log(`    ⚠️  Hauteur demandée (${newHeight}px) > actuelle (${currentHeight}px), conservation de la taille originale`);
        return false;
      }
      newWidth = Math.round((currentWidth * newHeight) / currentHeight);
    }

    // Vérifier si un redimensionnement est nécessaire
    if (newWidth === currentWidth && newHeight === currentHeight) {
      console.log(`    ✅ Dimensions déjà correctes (${currentWidth}x${currentHeight})`);
      return false;
    }

    // Effectuer le redimensionnement
    await image
      .resize(newWidth, newHeight, {
        fit: instructions.fit,
        withoutEnlargement: true // Éviter l'agrandissement par défaut
      })
      .toFile(imagePath + '.tmp');

    // Remplacer le fichier original
    copyFileSync(imagePath + '.tmp', imagePath);
    
    // Supprimer le fichier temporaire
    const fs = await import('fs/promises');
    await fs.unlink(imagePath + '.tmp');

    console.log(`    📏 Redimensionné : ${currentWidth}x${currentHeight} → ${newWidth}x${newHeight} (${instructions.fit})`);
    return true;

  } catch (error) {
    console.error(`    ❌ Erreur lors du redimensionnement :`, error.message);
    return false;
  }
}

function getAllImageFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllImageFiles(fullPath, files);
    } else if (supportedExtensions.includes(extname(item).toLowerCase())) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSizeInBytes(filePath) {
  try {
    return statSync(filePath).size;
  } catch {
    return 0;
  }
}

async function optimizeImages() {
  console.log(`🖼️  Optimisation des images dans public/assets...${forceOptimization ? ' (FORCE MODE)' : ''}\n`);

  const assetsDir = join(projectRoot, 'public', 'assets');
  const backupDir = join(projectRoot, 'public', 'assets', '.backup');
  const logPath = join(backupDir, '.optimization-log.json');

  // Vérifier que le dossier assets existe
  if (!existsSync(assetsDir)) {
    console.error('❌ Erreur: Le dossier public/assets n\'existe pas');
    process.exit(1);
  }

  // Créer le dossier de backup s'il n'existe pas
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
    console.log('📁 Dossier de backup créé : public/assets/.backup');
  }

  // Charger le log d'optimisation
  const optimizationLog = loadOptimizationLog(logPath);

  // Récupérer tous les fichiers images
  const imageFiles = getAllImageFiles(assetsDir).filter(file => !file.includes('.backup'));
  
  if (imageFiles.length === 0) {
    console.log('ℹ️  Aucune image trouvée dans public/assets');
    return;
  }

  console.log(`📊 ${imageFiles.length} image(s) trouvée(s)${forceOptimization ? ' (re-optimisation forcée)' : ''} :\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let skippedCount = 0;
  let optimizedCount = 0;
  const results = [];

  for (const imagePath of imageFiles) {
    const fileName = basename(imagePath);
    const backupPath = join(backupDir, fileName);
    const originalSize = getFileSizeInBytes(imagePath);
    
    console.log(`🔄 Traitement de ${fileName}...`);

    // Vérifier si l'image est déjà optimisée
    if (isImageAlreadyOptimized(imagePath, backupPath, optimizationLog, fileName)) {
      console.log(`  ✅ Déjà optimisé, ignoré`);
      skippedCount++;
      
      // Ajouter aux stats même si ignoré
      totalOriginalSize += originalSize;
      totalOptimizedSize += originalSize;
      continue;
    }

    try {
      // Créer une sauvegarde avant optimisation (seulement si elle n'existe pas)
      if (!existsSync(backupPath)) {
        copyFileSync(imagePath, backupPath);
        console.log(`  💾 Backup créé : ${fileName}`);
      } else if (forceOptimization) {
        console.log(`  💾 Backup existant utilisé : ${fileName}`);
      }

      // Analyser les instructions de redimensionnement dans le nom de fichier
      const resizeInstructions = parseResizeInstructions(fileName);
      let wasResized = false;
      
      // Redimensionner l'image si nécessaire
      if (resizeInstructions.hasInstructions) {
        console.log(`  🔍 Instructions détectées : w${resizeInstructions.width || '?'} h${resizeInstructions.height || '?'} fit:${resizeInstructions.fit}`);
        wasResized = await resizeImage(imagePath, resizeInstructions);
      }

      // Optimiser l'image
      const optimizedImages = await imagemin([imagePath], {
        destination: dirname(imagePath),
        plugins: [
          imageminPngquant({
            quality: compressionConfig.png.quality,
            speed: compressionConfig.png.speed
          }),
          imageminMozjpeg({
            quality: compressionConfig.jpg.quality,
            progressive: compressionConfig.jpg.progressive
          })
        ]
      });

      if (optimizedImages.length > 0) {
        const optimizedSize = getFileSizeInBytes(imagePath);
        const savings = originalSize - optimizedSize;
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

        totalOriginalSize += originalSize;
        totalOptimizedSize += optimizedSize;
        optimizedCount++;

        // Enregistrer dans le log d'optimisation
        const currentHash = getMD5Hash(imagePath);
        const backupHash = getMD5Hash(backupPath);
        
        optimizationLog[fileName] = {
          originalSize,
          optimizedSize,
          originalHash: backupHash,
          currentHash: currentHash,
          lastOptimized: new Date().toISOString(),
          savingsPercent: parseFloat(savingsPercent),
          wasResized: wasResized,
          resizeInstructions: resizeInstructions.hasInstructions ? resizeInstructions : null
        };

        results.push({
          fileName,
          originalSize,
          optimizedSize,
          savings,
          savingsPercent: parseFloat(savingsPercent)
        });

        if (savings > 0) {
          console.log(`  ✅ Optimisé : ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (-${savingsPercent}%)`);
        } else {
          console.log(`  ✅ Déjà optimal : ${formatBytes(originalSize)}`);
        }
      }

    } catch (error) {
      console.error(`  ❌ Erreur lors de l'optimisation de ${fileName}:`, error.message);
    }

    console.log('');
  }

  // Sauvegarder le log d'optimisation
  saveOptimizationLog(logPath, optimizationLog);

  // Afficher le résumé
  console.log('📈 RÉSUMÉ DE L\'OPTIMISATION');
  console.log('='.repeat(50));
  
  const totalSavings = totalOriginalSize - totalOptimizedSize;
  const totalSavingsPercent = totalOriginalSize > 0 ? ((totalSavings / totalOriginalSize) * 100).toFixed(1) : 0;

  console.log(`📁 Images trouvées      : ${imageFiles.length}`);
  console.log(`🔄 Images optimisées    : ${optimizedCount}`);
  console.log(`⏭️  Images ignorées      : ${skippedCount}`);
  console.log(`📏 Taille originale     : ${formatBytes(totalOriginalSize)}`);
  console.log(`📦 Taille optimisée     : ${formatBytes(totalOptimizedSize)}`);
  console.log(`💾 Espace économisé     : ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);

  if (results.length > 0) {
    console.log('\n📋 DÉTAIL DES OPTIMISATIONS');
    console.log('-'.repeat(50));
    
    results
      .sort((a, b) => b.savings - a.savings)
      .forEach(result => {
        const { fileName, originalSize, optimizedSize, savingsPercent } = result;
        console.log(`${fileName.padEnd(30)} : ${formatBytes(originalSize).padStart(8)} → ${formatBytes(optimizedSize).padStart(8)} (-${savingsPercent}%)`);
      });
  }

  console.log('\n🎉 Optimisation terminée !');
  console.log(`💡 Les fichiers originaux sont sauvegardés dans : public/assets/.backup`);
  
  if (skippedCount > 0 && !forceOptimization) {
    console.log(`💡 Utilisez --force pour re-optimiser les images déjà traitées`);
  }
}

// Lancer l'optimisation
optimizeImages().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});