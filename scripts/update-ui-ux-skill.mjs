import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repository = 'nextlevelbuilder/ui-ux-pro-max-skill';
const skillDir = '.codex/skills/ui-ux-pro-max';
const claudeLink = '.claude/skills/ui-ux-pro-max';
const versionFile = join(skillDir, 'VERSION');
const requestTimeoutMs = 120_000;

async function fetchOk(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response;
}

async function latestReleaseTag() {
  const release = await (
    await fetchOk(`https://api.github.com/repos/${repository}/releases/latest`)
  ).json();
  if (typeof release.tag_name !== 'string') {
    throw new Error('The latest release has no tag name.');
  }
  return release.tag_name;
}

function installedTag() {
  return existsSync(versionFile)
    ? readFileSync(versionFile, 'utf8').trim()
    : null;
}

async function downloadSkill(tag, workDir) {
  const archive = join(workDir, 'release.tar.gz');
  const response = await fetchOk(
    `https://codeload.github.com/${repository}/tar.gz/refs/tags/${tag}`,
  );
  writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  const extractDir = join(workDir, 'release');
  mkdirSync(extractDir);
  execFileSync('tar', ['-xzf', archive, '-C', extractDir]);
  const [releaseRoot] = readdirSync(extractDir);
  const source = join(
    extractDir,
    releaseRoot,
    '.claude',
    'skills',
    'ui-ux-pro-max',
  );
  if (!existsSync(join(source, 'SKILL.md'))) {
    throw new Error(`${tag} has no .claude/skills/ui-ux-pro-max/SKILL.md`);
  }
  return source;
}

// Upstream ships it as a Claude plugin; a repo has no plugin root, so the documented script paths must point at the vendored copy.
function rewriteScriptPaths() {
  const skillFile = join(skillDir, 'SKILL.md');
  const content = readFileSync(skillFile, 'utf8');
  writeFileSync(
    skillFile,
    content.replaceAll(
      '${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max',
      skillDir,
    ),
  );
}

function linkForClaude() {
  if (lstatExists(claudeLink)) {
    return;
  }
  mkdirSync('.claude/skills', { recursive: true });
  symlinkSync('../../.codex/skills/ui-ux-pro-max', claudeLink);
}

function lstatExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

const tag = process.argv[2] ?? (await latestReleaseTag());
if (installedTag() === tag) {
  linkForClaude();
  process.stdout.write(`ui-ux-pro-max is already at ${tag}.\n`);
  process.exit(0);
}

const workDir = mkdtempSync(join(tmpdir(), 'ui-ux-pro-max-'));
try {
  const source = await downloadSkill(tag, workDir);
  rmSync(skillDir, { recursive: true, force: true });
  cpSync(source, skillDir, { recursive: true });
  rewriteScriptPaths();
  writeFileSync(versionFile, `${tag}\n`);
  linkForClaude();
  process.stdout.write(`ui-ux-pro-max updated to ${tag}.\n`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
