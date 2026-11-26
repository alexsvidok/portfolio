const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Preparing deployment commit in dist...');
const distDir = path.join(__dirname, 'dist');
process.chdir(distDir);

if (!fs.existsSync(path.join(distDir, '.git'))) {
  execSync('git init -b gh-pages', { stdio: 'inherit' });
  execSync('git config user.name "alexsvidok"', { stdio: 'inherit' });
  execSync('git config user.email "svidokpr@gmail.com"', { stdio: 'inherit' });
  execSync('git remote add origin https://github.com/alexsvidok/portfolio.git', { stdio: 'inherit' });
}

execSync('git branch -M gh-pages', { stdio: 'inherit' });
execSync('git add -A', { stdio: 'inherit' });
execSync('git commit -m "Deploy to GitHub Pages" --allow-empty', { stdio: 'inherit' });

console.log('Pushing dist to gh-pages branch...');
execSync('git push -u origin gh-pages --force', { stdio: 'inherit' });
console.log('✨ Published to GitHub Pages!');
