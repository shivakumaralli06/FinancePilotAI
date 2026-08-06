const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const rootDir = path.resolve(__dirname, '..');
const rawUrl = process.argv[2] || 'https://github.com/shivakumaralli06/FinancePilot-AI.git';
const githubToken = process.argv[3];

if (!githubToken) {
  console.log('Usage: node git-push.js <GITHUB_REPO_URL> <GITHUB_PERSONAL_ACCESS_TOKEN>');
  process.exit(1);
}

// Embed token into URL for GitHub fine-grained PAT support: https://x-access-token:TOKEN@github.com/user/repo.git
const authedUrl = rawUrl.replace('https://github.com/', `https://x-access-token:${githubToken}@github.com/`);

async function pushToGithub() {
  console.log(`🚀 Connecting to remote: ${rawUrl}...`);

  await git.addRemote({
    fs,
    dir: rootDir,
    remote: 'origin',
    url: authedUrl,
    force: true
  });

  console.log('📤 Pushing branch [main] to GitHub...');
  await git.push({
    fs,
    http,
    dir: rootDir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({
      username: 'x-access-token',
      password: githubToken
    }),
  });

  console.log('🎉 Successfully pushed your code to GitHub!');
}

pushToGithub().catch(err => {
  console.error('❌ Push failed:', err.message);
});
