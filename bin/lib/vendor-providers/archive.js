'use strict';

module.exports = {
  name: 'archive',
  validate(upstream) {
    if (!upstream.path) {
      throw new Error('upstream.provider=archive 时必须提供 path');
    }
  },
  sync({ projectRoot, upstream, vendorDir, shared, packName }) {
    const archivePath = shared.resolveUpstreamPath(projectRoot, upstream.path);
    if (!archivePath || !shared.fs.existsSync(archivePath)) {
      throw new Error(`archive 源不存在: ${archivePath || upstream.path}`);
    }
    shared.rmSafe(vendorDir);
    shared.fs.mkdirSync(vendorDir, { recursive: true });
    shared.extractArchive(archivePath, vendorDir);
    shared.writeVendorMetadata(vendorDir, {
      pack: packName,
      provider: 'archive',
      path: upstream.path,
      version: upstream.version || '',
      sourceSignature: shared.hashFile(archivePath),
      vendorSignature: shared.hashDirectory(vendorDir),
    });
    return {
      pack: packName,
      provider: 'archive',
      action: 'updated',
      vendorDir,
      repo: null,
      commit: null,
      version: upstream.version || '',
    };
  },
  status({ projectRoot, upstream, vendorDir, shared, packName, metadata }) {
    const archivePath = shared.resolveUpstreamPath(projectRoot, upstream.path);
    const sourceExists = !!archivePath && shared.fs.existsSync(archivePath);
    const sourceSignature = sourceExists ? shared.hashFile(archivePath) : null;
    const vendorSignature = shared.hashDirectory(vendorDir);
    const dirty = metadata && metadata.vendorSignature ? vendorSignature !== metadata.vendorSignature : true;

    return {
      pack: packName,
      provider: 'archive',
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
