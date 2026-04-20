---
name: frontend-design
description: 前端设计美学秘典。UI美学、组件模式、UX原则。当魔尊需要前端设计、UI/UX指导、组件设计时使用。
license: MIT
user-invocable: true
disable-model-invocation: false
---

# 前端设计美学秘典

## 知识主题

| 主题 | 文档 | 涵盖 |
|------|------|------|
| UI美学 | [ui-aesthetics.md](ui-aesthetics.md) | 色彩、排版、间距、视觉层次、设计令牌 |
| 组件模式 | [component-patterns.md](component-patterns.md) | 布局、响应式、交互、动画、表单 |
| UX原则 | [ux-principles.md](ux-principles.md) | 可用性、无障碍、信息架构、移动优先 |
| 状态管理 | [state-management.md](state-management.md) | Redux、Zustand、Jotai、Context API |
| 前端工程化 | [engineering.md](engineering.md) | Web Vitals、Vitest/Playwright、Vite |

## 风格选型决策树

```
需求 → 品牌调性？
├─ 前卫 / 反叛 / 高饱和 → Neubrutalism
├─ 柔和 / 亲和 / 圆润 → Claymorphism
├─ 通透 / 层叠 / 科技感 → Glassmorphism
└─ Apple 风 / 极致精致 → Liquid Glass

性能约束？
├─ 低端移动端 → Neubrutalism（零 blur，最轻）
├─ 中端设备 → Claymorphism（纯 box-shadow）
└─ 高端 / 桌面 → Glassmorphism / Liquid Glass
```

## 风格一览

| 风格 | 文档 | 核心 CSS | 移动端开销 |
|------|------|----------|-----------|
| Neubrutalism | [SKILL.md](neubrutalism/SKILL.md) | `box-shadow`, `border` | 极低 |
| Claymorphism | [SKILL.md](claymorphism/SKILL.md) | `box-shadow`(inset) | 低 |
| Glassmorphism | [SKILL.md](glassmorphism/SKILL.md) | `backdrop-filter` | 高 |
| Liquid Glass | [SKILL.md](liquid-glass/SKILL.md) | `backdrop-filter` + `saturate` | 高 |

## 浏览器支持总览

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+(`-webkit-`) | 79+ |
| `filter: saturate()` | 53+ | 35+ | 9.1+ | 79+ |
| `@supports` | 28+ | 22+ | 9+ | 12+ |
| `prefers-reduced-motion` | 74+ | 63+ | 10.1+ | 79+ |

## 通用无障碍清单

1. 文字对比度 ≥ 4.5:1（WCAG AA），大字 ≥ 3:1
2. `:focus-visible` 轮廓 ≥ 2px，`outline-offset: 2px`
3. `prefers-reduced-motion: reduce` 禁动画，仅保留 `opacity`
4. `prefers-contrast: more` 增强边界、降低透明
5. 触控目标 ≥ 44×44px
6. 语义化 HTML，`aria-label` 补充图标按钮
