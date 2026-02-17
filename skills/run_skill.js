#!/usr/bin/env node
/**
 * Skills 运行入口
 * 跨平台统一调用各 skill 脚本
 *
 * 用法:
 *     node run_skill.js <skill_name> [args...]
 *
 * 示例:
 *     node run_skill.js verify-module ./my-project -v
 *     node run_skill.js verify-security ./src --json
 *     node run_skill.js verify-change --mode staged
 *     node run_skill.js verify-quality ./src
 *     node run_skill.js gen-docs ./new-module --force
 */

const { spawn } = require('child_process');
const { readdirSync, statSync, writeFileSync, unlinkSync, closeSync, openSync } = require('fs');
const { join, resolve } = require('path');
const { createHash } = require('crypto');
const { tmpdir } = require('os');

const IS_WIN = process.platform === 'win32';

function getSkillsDir() {
  const override = process.env.SAGE_SKILLS_DIR;
  if (override) return resolve(override);
  return __dirname;
}

function discoverSkills(skillsDir) {
  const found = {};
  const toolsDir = join(skillsDir, 'tools');
  let entries;
  try { entries = readdirSync(toolsDir).sort(); } catch { return found; }

  for (const name of entries) {
    const scriptsDir = join(toolsDir, name, 'scripts');
    let scripts;
    try { scripts = readdirSync(scriptsDir); } catch { continue; }
    const jsFile = scripts.find(f => f.endsWith('.js'));
    if (jsFile) found[name] = join(scriptsDir, jsFile);
  }
  return found;
}

function getScriptPath(skillName) {
  const available = discoverSkills(getSkillsDir());
  if (!(skillName in available)) {
    const names = Object.keys(available).join(', ') || '(无)';
    console.error(`错误: 未知的 skill '${skillName}'`);
    console.error(`可用的 skills: ${names}`);
    process.exit(1);
  }
  return available[skillName];
}

function acquireTargetLock(args) {
  const target = args.find(a => !a.startsWith('-')) || process.cwd();
  const hash = createHash('md5').update(resolve(target)).digest('hex').slice(0, 12);
  const lockPath = join(tmpdir(), `sage_skill_${hash}.lock`);

  try {
    const fd = openSync(lockPath, 'wx');
    return { fd, lockPath };
  } catch (e) {
    if (e.code === 'EEXIST') {
      console.log(`⏳ 等待锁释放: ${target}`);
      // 轮询等待，最多 30s
      const deadline = Date.now() + 30000;
      while (Date.now() < deadline) {
        try {
          const fd = openSync(lockPath, 'wx');
          return { fd, lockPath };
        } catch { /* busy wait */ }
        const wait = 100;
        const start = Date.now();
        while (Date.now() - start < wait) { /* spin */ }
      }
      console.error(`⏳ 等待锁超时: ${target}`);
      process.exit(1);
    }
    // 其他错误，忽略锁继续执行
    return { fd: null, lockPath: null };
  }
}

function releaseLock({ fd, lockPath }) {
  if (fd !== null) {
    try { closeSync(fd); } catch {}
  }
  if (lockPath) {
    try { unlinkSync(lockPath); } catch {}
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    console.log(__filename.split('/').pop() + ' <skill_name> [args...]');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const skillName = args[0];
  const scriptPath = getScriptPath(skillName);
  const scriptArgs = args.slice(1);

  const lock = acquireTargetLock(scriptArgs);

  const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
    stdio: 'inherit',
  });

  child.on('close', (code) => {
    releaseLock(lock);
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error(`执行错误: ${err.message}`);
    releaseLock(lock);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n已取消');
    child.kill('SIGINT');
    releaseLock(lock);
    process.exit(130);
  });
}

main();
