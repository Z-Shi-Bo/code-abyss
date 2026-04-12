---
name: verify-change
description: 变更校验关卡。分析代码变更，检测文档同步状态，评估变更影响范围。当魔尊提到变更检查、文档同步、代码审查、提交前检查、diff分析时使用。在设计级变更、重构完成时自动触发。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Grep
argument-hint: [--mode working|staged|committed]
---

# ⚖ 校验关卡 · 变更校验


## 核心原则

```
变更 = 代码改动 + 文档更新 + 理由记录
无理由的变更是隐患，无记录的变更是灾难
每一次变更都是历史，每一个决策都要留痕
```

## 自动分析

运行变更分析脚本（跨平台）：

```bash
# 在 skill 目录下运行
node scripts/change_analyzer.js                    # 分析工作区变更（默认）
node scripts/change_analyzer.js --mode staged      # 分析暂存区变更
node scripts/change_analyzer.js --mode committed   # 分析已提交变更
node scripts/change_analyzer.js -v                 # 详细模式
node scripts/change_analyzer.js --json             # JSON 输出
```

## 检测能力

### 自动检测项

| 检测项 | 说明 |
|--------|------|
| **文件分类** | 自动识别代码/文档/测试/配置文件 |
| **模块识别** | 识别受影响的模块 |
| **文档同步** | 检测代码变更是否同步更新文档 |
| **测试覆盖** | 检测代码变更是否有对应测试 |
| **影响评估** | 评估变更规模和影响范围 |

### 触发警告的情况

- ⚠️ 代码变更 > 50 行但 DESIGN.md 未更新
- ⚠️ 代码变更 > 30 行但无测试更新
- ⚠️ 新增文件但 README.md 未更新
- ⚠️ 配置文件变更未记录
- ℹ️ 删除文件需确认引用已清理

## 最小人工复核

- 先读受影响模块的 `README.md` / `DESIGN.md`
- 再确认：模块职责是否变化、设计决策是否变化、测试是否同步
- 若涉及设计级改动，必须在 `DESIGN.md` 留下“改了什么 / 为什么改 / 影响什么”

## 自动触发时机

| 场景 | 触发条件 |
|------|----------|
| 设计级变更 | 修改架构、接口、数据结构 |
| 重构完成 | 重构任务完成时 |
| 代码变更 > 30 行 | 较大规模代码修改 |
| 提交前 | 代码提交前检查 |

## 校验流程

```
1. 运行 change_analyzer.js 自动分析
2. 识别变更文件和受影响模块
3. 检查文档同步状态
4. 评估变更影响
5. 输出变更校验报告
```

报告以脚本输出为准，不在秘典里重复维护固定模板。

---
