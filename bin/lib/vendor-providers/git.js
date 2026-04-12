'use strict';

module.exports = {
  name: 'git',
  validate(upstream) {
    if (!upstream.repo || !upstream.commit) {
      throw new Error('upstream.provider=git 时必须提供 repo 和 commit');
    }
  },
  sync({ upstream, vendorDir, shared, packName }) {
    let action = shared.fs.existsSync(vendorDir) ? 'updated' : 'cloned';
    if (!shared.fs.existsSync(vendorDir)) {
      shared.runGit(['clone', '--depth', '1', upstream.repo, vendorDir]);
    }
    shared.runGit(['fetch', '--depth', '1', 'origin', upstream.commit], vendorDir);
    shared.runGit(['checkout', '--detach', upstream.commit], vendorDir);
    shared.writeVendorMetadata(vendorDir, {
      pack: packName,
      provider: 'git',
      repo: upstream.repo,
      commit: upstream.commit,
      version: upstream.version || '',
      sourceSignature: upstream.commit,
      vendorSignature: shared.hashDirectory(vendorDir),
    });
    return {
      pack: packName,
      provider: 'git',
      action,
      vendorDir,
      repo: upstream.repo,
      commit: upstream.commit,
      version: upstream.version || '',
    };
  },
  status({ upstream, vendorDir, shared, packName, metadata }) {
    let currentCommit = null;
    try {
      currentCommit = shared.runGit(['rev-parse', 'HEAD'], vendorDir);
    } catch {
      currentCommit = null;
    }
    const vendorSignature = shared.hashDirectory(vendorDir);
    const dirty = metadata && metadata.vendorSignature ? vendorSignature !== metadata.vendorSignature : true;

    return {
      pack: packName,
      provider: 'git',
      vendorDir,
      exists: true,
      dirty,
      drifted: currentCommit !== upstream.commit,
      currentCommit,
      targetCommit: upstream.commit,
      sourceExists: true,
      metadata,
    };
  },
};
