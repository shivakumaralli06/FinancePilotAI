const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');

const rootDir = path.resolve(__dirname, '..');

async function initAndCommit() {
  console.log('🚀 Initializing Git repository with isomorphic-git...');
  await git.init({ fs, dir: rootDir, defaultBranch: 'main' });
  console.log('✅ Git repository initialized successfully!');

  // Simple file traversal ignoring node_modules, .git, and common ignore patterns
  const ignorePatterns = ['node_modules', '.git', 'dist', 'build', '.env'];

  function getAllFiles(dir, base = '') {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (ignorePatterns.includes(file)) continue;
      const fullPath = path.join(dir, file);
      const relPath = base ? `${base}/${file}` : file;
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(fullPath, relPath));
      } else {
        results.push(relPath);
      }
    }
    return results;
  }

  const files = getAllFiles(rootDir);
  console.log(`📦 Staging ${files.length} project files...`);

  for (const file of files) {
    await git.add({ fs, dir: rootDir, filepath: file });
  }

  const sha = await git.commit({
    fs,
    dir: rootDir,
    author: {
      name: 'FinancePilot Team',
      email: 'team@financepilot.ai',
    },
    message: 'Initial commit: FinancePilot AI full-stack application with Supabase DB'
  });

  console.log(`🎉 Commit created successfully! Commit SHA: ${sha}`);
  console.log('\n📌 Repository is now fully initialized with a local git commit on branch [main].');
}

initAndCommit().catch(err => {
  console.error('❌ Git operation failed:', err);
});
