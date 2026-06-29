import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.resolve(__dirname);
const zipPath = path.join(projectDir, 'smart-food-court-react-spring.zip');

console.log('📦 Starting project packaging...');

// Clean up existing zip if any
if (fs.existsSync(zipPath)) {
  try {
    fs.unlinkSync(zipPath);
    console.log('Cleaned old zip file.');
  } catch (e) {
    console.warn('Could not clean old zip file, skipping:', e.message);
  }
}

try {
  const tempDir = path.join(projectDir, 'temp_zip_dir');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir);
  
  // Copy backend/ excluding target/
  console.log('Copying backend files...');
  fs.mkdirSync(path.join(tempDir, 'backend'));
  execSync(`powershell -Command "Copy-Item -Path '${path.join(projectDir, 'backend', '*')}' -Destination '${path.join(tempDir, 'backend')}' -Recurse -Exclude 'target'"`);
  
  // Copy frontend/ excluding node_modules/ and dist/
  console.log('Copying frontend files...');
  fs.mkdirSync(path.join(tempDir, 'frontend'));
  execSync(`powershell -Command "Copy-Item -Path '${path.join(projectDir, 'frontend', '*')}' -Destination '${path.join(tempDir, 'frontend')}' -Recurse -Exclude 'node_modules', 'dist'"`);

  // Copy root packaging files
  fs.copyFileSync(path.join(projectDir, 'zip_project.js'), path.join(tempDir, 'zip_project.js'));

  // Zip the temp directory
  console.log('Running archive command...');
  const cmd = `powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(cmd, { stdio: 'inherit' });
  
  // Clean up temp
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  console.log(`\n✅ React + Spring Boot Project successfully packaged!`);
  console.log(`Location: ${zipPath}`);
} catch (error) {
  console.error('❌ Error packaging project:', error.message);
  process.exit(1);
}
