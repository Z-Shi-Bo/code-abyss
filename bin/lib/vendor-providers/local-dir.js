'use strict';

module.exports = {
  name: 'local-dir',
  validate(upstream) {
    if (!upstream.path) {
      throw new Error('upstream.provider=local-dir 时必须提供 path');
    }
  },
  sync({ projectRoot, upstream, vendorDir, shared, packName }) {
    const sourcePath = shared.resolveUpstreamPath(projectRoot, upstream.path);
    if (!sourcePath || !shared.fs.existsSync(sourcePath)) {
      throw new Error(`local-dir 源不存在: ${sourcePath || upstream.path}`);
    }
    shared.rmSafe(vendorDir);
    shared.copyRecursive(sourcePath, vendorDir);
    shared.writeVendorMetadata(vendorDir, {
      pack: packName,
      provider: 'local-dir',
      path: upstream.path,
      version: upstream.version || '',
      sourceSignature: shared.hashDirectory(sourcePath),
      vendorSignature: shared.hashDirectory(vendorDir),
    });
    return {
      pack: packName,
      provider: 'local-dir',
      action: 'updated',
      vendorDir,
      repo: null,
      commit: null,
      version: upstream.version || '',
    };
  },
  status({ projectRoot, upstream, vendorDir, shared, packName, metadata }) {
    const sourcePath = shared.resolveUpstreamPath(projectRoot, upstream.path);
    const sourceExists = !!sourcePath && shared.fs.existsSync(sourcePath);
    const sourceSignature = sourceExists ? shared.hashDirectory(sourcePath) : null;
    const vendorSignature = shared.hashDirectory(vendorDir);
    const dirty = metadata && metadata.vendorSignature ? vendorSignature !== metadata.vendorSignature : true;

    return {
      pack: packName,
      provider: 'local-dir',
      vendorDir,
      exists: true,
      dirty,
      drifted: !sourceExists || sourceSignature !== (metadata && metadata.sourceSignature),
      currentCommit: null,
      targetCommit: null,
      sourceExists,
      metadata,
    };
  },
};
