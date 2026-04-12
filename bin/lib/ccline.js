'use strict';
const fs = require('fs');
const path = require('path');

function detectCclineBin(cclineBin, warn) {
  if (fs.existsSync(cclineBin)) return true;
  try {
    require('child_process').execSync('ccline --version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    if (e.code !== 'ENOENT' && warn) {
      warn(`ccline --version 检测异常: ${e.message}`);
    }
    return false;
  }
}

function installCclineBin(cclineBin, errors, { info, ok }) {
  const { execSync } = require('child_process');
  info('ccline 未检测到，正在安装...');
  try {
    execSync('npm install -g @cometix/ccline@1', { stdio: 'inherit' });
    if (fs.existsSync(cclineBin)) { ok('ccline 二进制安装成功'); return true; }
    try {
      execSync('ccline --version', { stdio: 'pipe' });
      ok('ccline 安装成功 (全局)');
      return true;
    } catch {}
    errors.push('ccline 二进制安装后仍未检测到. Try: sudo npm install -g @cometix/ccline@1');
    return false;
  } catch (e) {
    errors.push(`npm install -g @cometix/ccline 失败: ${e.message}. Try: sudo npm install -g @cometix/ccline@1`);
    return false;
  }
}

function deployCclineConfig(cclineDir, errors, { HOME, PKG_ROOT, ok }) {
  const { execSync } = require('child_process');
  const bundledConfig = path.join(PKG_ROOT, 'config', 'ccline', 'config.toml');
  const targetConfig = path.join(cclineDir, 'config.toml');
  if (fs.existsSync(bundledConfig)) {
    fs.mkdirSync(cclineDir, { recursive: true });
    if (fs.existsSync(targetConfig)) {
      const backupDir = path.join(HOME, '.claude', '.sage-backup');
      fs.mkdirSync(backupDir, { recursive: true });
      fs.copyFileSync(targetConfig, path.join(backupDir, 'ccline-config.toml'));
    }
    fs.copyFileSync(bundledConfig, targetConfig);
    ok('ccline/config.toml 已部署 (Code Abyss 定制版)');
  } else if (!fs.existsSync(targetConfig)) {
    try { execSync('ccline --init', { stdio: 'inherit' }); ok('ccline 默认配置已生成'); }
    catch (e) { errors.push(`ccline --init 失败: ${e.message}`); }
  }
}

async function installCcline(ctx, deps) {
  const { HOME, PKG_ROOT, CCLINE_STATUS_LINE, ok, warn, info, fail, c } = deps;
  console.log('');
  info('安装 ccline 状态栏...');
  const cclineDir = path.join(HOME, '.claude', 'ccline');
  const cclineBin = path.join(cclineDir, process.platform === 'win32' ? 'ccline.exe' : 'ccline');
  const errors = [];

  let hasBin = detectCclineBin(cclineBin, warn);
  if (!hasBin) hasBin = installCclineBin(cclineBin, errors, { info, ok });
  else ok('ccline 二进制已存在');

  deployCclineConfig(cclineDir, errors, { HOME, PKG_ROOT, ok });

  // Only set statusLine if ccline binary was successfully detected/installed
  if (hasBin) {
    ctx.settings.statusLine = CCLINE_STATUS_LINE.statusLine;
    ok(`statusLine → ${c.cyn(CCLINE_STATUS_LINE.statusLine.command)}`);
    fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
  } else {
    warn('跳过 statusLine 配置: ccline 二进制不可用');
  }

  if (errors.length > 0) {
    console.log('');
    warn(c.b(`ccline 安装有 ${errors.length} 个问题:`));
    errors.forEach(e => fail(`  ${e}`));
  }

  console.log('');
  warn(`需要 ${c.b('Nerd Font')} 字体才能正确显示图标`);
  info(`推荐: FiraCode Nerd Font / JetBrainsMono Nerd Font`);
  info(`下载: ${c.cyn('https://www.nerdfonts.com/')}`);
  ok('ccline 配置完成');
}

module.exports = { detectCclineBin, installCclineBin, deployCclineConfig, installCcline };
