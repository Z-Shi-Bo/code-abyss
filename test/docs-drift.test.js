'use strict';

const fs = require('fs');
const path = require('path');

describe('docs drift guard', () => {
  const projectRoot = path.join(__dirname, '..');

  test('README 不再写死过时 skill 数量与旧 Codex 入口', () => {
    const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');

    expect(readme).not.toContain('56 篇');
    expect(readme).not.toContain('~/.codex/prompts');
  });

  test('CHANGELOG 对历史 skill 数量与旧 Codex 入口显式标注历史语境', () => {
    const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf8');

    expect(changelog).not.toContain('— 22 skills 通过\n');
    expect(changelog).toContain('历史口径');
    expect(changelog).toContain('当时的 Codex 安装流程');
  });

  test('DESIGN 不再宣称 Codex 运行时生成 AGENTS.md', () => {
    const design = fs.readFileSync(path.join(projectRoot, 'DESIGN.md'), 'utf8');

    expect(design).not.toContain('Codex 安装时会按所选 style 动态生成');
    expect(design).toContain('skills-only');
  });
});
