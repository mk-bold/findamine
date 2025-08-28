// Prepend a timestamped entry to AGENT.md. Input: either a file path arg or STDIN.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const agentPath = path.join(root, 'AGENT.md');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const argPath = process.argv[2];
  const content = argPath ? fs.readFileSync(argPath, 'utf8') : await readStdin();
  if (!content || !content.trim()) {
    console.error('No summary content provided. Pass a file path or pipe text.');
    process.exit(1);
  }
  const now = new Date().toISOString();
  const header = `\n### ${now}\n`;
  const block = `${header}${content.trim()}\n`;

  const exists = fs.existsSync(agentPath);
  if (!exists) {
    fs.writeFileSync(agentPath, `# AGENT.md — Project Memory\n\n## Context Snippets (summaries of chat threads)\n\n${block}`);
    console.log('Created AGENT.md and wrote entry.');
    return;
  }
  const original = fs.readFileSync(agentPath, 'utf8');
  const marker = '<!-- NEW ENTRIES PREPEND ABOVE THIS LINE -->';
  const idx = original.indexOf(marker);
  if (idx !== -1) {
    const before = original.slice(0, idx);
    const after = original.slice(idx);
    fs.writeFileSync(agentPath, `${before}${block}${after}`);
  } else {
    // Prepend to top if marker missing
    fs.writeFileSync(agentPath, `${block}${original}`);
  }
  console.log('Prepended summary to AGENT.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});