const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const zipFile = path.join(rootDir, 'sports-talent-ai.zip');
const psFile = path.join(rootDir, 'pack_temp.ps1');

if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

const psContent = `
$exclude = @('node_modules', '__pycache__', '.git', 'sports-talent-ai.zip', 'pack_temp.ps1')
$items = Get-ChildItem -Path '${rootDir.replace(/\\/g, "/")}' -Recurse | Where-Object {
    $fullName = $_.FullName
    $skip = $false
    foreach ($ex in $exclude) {
        if ($fullName -match [regex]::Escape($ex)) {
            $skip = $true
            break
        }
    }
    -not $skip
}
Compress-Archive -Path $items.FullName -DestinationPath '${zipFile.replace(/\\/g, "/")}' -Force
`;

fs.writeFileSync(psFile, psContent, 'utf8');

try {
  console.log('[PACK] Archiving project files into sports-talent-ai.zip...');
  execSync(`powershell -ExecutionPolicy Bypass -File "${psFile}"`, { stdio: 'inherit' });
  if (fs.existsSync(psFile)) fs.unlinkSync(psFile);
  
  if (fs.existsSync(zipFile)) {
    const stats = fs.statSync(zipFile);
    console.log(`[SUCCESS] Project archived successfully!`);
    console.log(`Location: ${zipFile}`);
    console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
  }
} catch (err) {
  console.error('[ERROR] Failed to create zip archive:', err.message);
  if (fs.existsSync(psFile)) fs.unlinkSync(psFile);
}
