---
name: sage
description: 邪修红尘仙·神通秘典总纲。智能路由到专业秘典。当魔尊需要开发、安全、架构、DevOps、AI 能力时，由此索引到最匹配的秘典。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 神通秘典 · 总纲

## 核心职责

- `domains/`：知识型秘典，负责场景路由、原则与模板
- `tools/`：可执行关卡，负责验证、扫描、生成
- `orchestration/`：多 Agent 协同规范
- `run_skill.js`：脚本型 skill 统一执行入口

## 路由原则

### 安全

- 红队 / exploit / pentest / bypass → `domains/security/*`
- 蓝队 / 应急 / IOC / SIEM / EDR → `domains/security/blue-team.md`
- 审计 / 污点 / sink → `domains/security/code-audit.md`

### 工程

- 语言开发 → `domains/development/*`
- 架构 / API / 云原生 → `domains/architecture/*`
- Git / 测试 / 数据库 / DevOps → `domains/devops/*`
- AI / Agent / RAG / Prompt → `domains/ai/*`

### 协同

- 多 Agent / 并行 / 编排 → `orchestration/multi-agent/SKILL.md`

## 运行时规则

- `user-invocable: true` 的 skill 才进入调用集合
- scripted skill：存在且仅存在一个 `scripts/*.js`
- knowledge skill：只读 `SKILL.md`，不执行脚本
- Claude 生成 `~/.claude/commands/*.md`
- Codex 从 `~/.agents/skills/**/SKILL.md` 直接发现 skill

## 自动关卡

- 新建模块：`/gen-docs` → `/verify-module` → `/verify-security`
- 大改动：`/verify-change` → `/verify-quality`
- 安全相关：`/verify-security`

## 作者入口

完整 authoring contract、frontmatter 规则、fail-fast 校验与生成链见：

- `docs/SKILL_AUTHORING.md`
- `docs/PACK_MANIFEST_SCHEMA.md`
- `docs/PACKS_LOCK_SCHEMA.md`
