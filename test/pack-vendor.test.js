'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const {
  syncPackVendor,
  getPackVendorStatus,
} = require('../bin/lib/pack-vendor');
const { validatePackManifest } = require('../bin/lib/pack-registry');

describe('pack vendor providers', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-pack-vendor-'));
    fs.mkdirSync(path.join(tmpDir, 'packs'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeManifest(name, upstream) {
    const dir = path.join(tmpDir, 'packs', name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({
      name,
      description: `${name} pack`,
      upstream,
      hosts: {
        claude: {
          uninstall: {
            runtimeRoot: { root: 'claude', path: `skills/${name}` },
          },
        },
      },
    }, null, 2));
  }

  test('validatePackManifest 校验 upstream provider 字段', () => {
    expect(() => validatePackManifest({
      name: 'bad',
      description: 'bad',
      upstream: { provider: 'archive' },
      hosts: { claude: { uninstall: { runtimeRoot: { root: 'claude', path: 'skills/bad' } } } },
    }, '/tmp/bad.json')).toThrow(/必须提供 path/);
  });

  test('syncPackVendor 支持 local-dir provider', () => {
    const sourceDir = path.join(tmpDir, 'local-source');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'README.md'), 'local source\n');
    writeManifest('local-pack', { provider: 'local-dir', path: 'local-source' });

    const report = syncPackVendor(tmpDir, 'local-pack');
    const status = getPackVendorStatus(tmpDir, 'local-pack');

    expect(report.provider).toBe('local-dir');
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'vendor', 'local-pack', 'README.md'))).toBe(true);
    expect(status).toMatchObject({ exists: true, dirty: false, drifted: false, provider: 'local-dir' });
  });

  test('syncPackVendor 支持 archive provider', () => {
    const sourceDir = path.join(tmpDir, 'archive-source');
    const archivePath = path.join(tmpDir, 'archive-source.tgz');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'README.md'), 'archive source\n');
    spawnSync('tar', ['-czf', archivePath, '-C', sourceDir, '.'], { encoding: 'utf8' });
    writeManifest('archive-pack', { provider: 'archive', path: 'archive-source.tgz' });

    const report = syncPackVendor(tmpDir, 'archive-pack');
    const status = getPackVendorStatus(tmpDir, 'archive-pack');

    expect(report.provider).toBe('archive');
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'vendor', 'archive-pack', 'README.md'))).toBe(true);
    expect(status).toMatchObject({ exists: true, dirty: false, drifted: false, provider: 'archive' });
  });
});
