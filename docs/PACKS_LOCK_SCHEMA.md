# Packs Lock Schema

`.code-abyss/packs.lock.json` is the project-level declaration for which packs should be synchronized for each host.

## Minimal shape

```json
{
  "version": 1,
  "hosts": {
    "claude": {
      "required": ["gstack"],
      "optional": [],
      "optional_policy": "auto",
      "sources": {
        "gstack": "pinned"
      }
    },
    "codex": {
      "required": ["gstack"],
      "optional": [],
      "optional_policy": "auto",
      "sources": {
        "gstack": "pinned"
      }
    }
  }
}
```

## Fields

### `version`

- Current value: `1`

### `hosts`

Known hosts today:

- `claude`
- `codex`

Each host block may contain:

- `required`: packs that are always installed
- `optional`: packs that may be installed depending on policy
- `optional_policy`: `auto | prompt | off`
- `sources`: per-pack install source mode

## Source modes

`sources.<pack>` supports:

- `pinned`: use the pack manifest's pinned upstream source
- `local`: use `.code-abyss/vendor/<pack>` or a host-specific env override
- `disabled`: keep the declaration but skip installation

Rules:

- `required` packs must not use `disabled`
- a pack cannot appear in both `required` and `optional`
- `abyss` is the core bundled pack and should not be listed in `packs.lock`

## Optional policy semantics

- `auto`: install optional packs automatically
- `prompt`: ask in interactive installs; `-y` falls back to automatic install
- `off`: skip optional packs

## Validation

`node bin/packs.js check` enforces:

- valid `version`
- only known hosts
- only known packs
- valid `optional_policy`
- valid `sources.<pack>` mode
- no `required+optional` duplication
- no `required` pack with `source=disabled`

## Bootstrap flow

Recommended commands:

```bash
npm run packs:bootstrap
npm run packs:bootstrap -- --apply-docs
npm run packs:update -- --host codex --add-optional gstack --optional-policy prompt --set-source gstack=local
npm run packs:check
npm run packs:diff
```

## Vendor workflow

When a pack uses `source=local`:

```bash
npm run packs:vendor:pull -- gstack
npm run packs:vendor:sync
npm run packs:vendor:sync -- --check
npm run packs:vendor:status -- gstack
```

## Drift reporting

- `packs:diff` compares the current lock against the manifest-derived defaults
- install/uninstall actions write JSON artifacts to `.code-abyss/reports/`
- `node bin/packs.js report list`
- `node bin/packs.js report latest --kind install-codex`
