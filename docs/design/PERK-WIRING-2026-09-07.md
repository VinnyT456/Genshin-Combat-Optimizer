# Perk support and selection — 2026-09-07

Owner: manager acting as UI/UX engineer, explicitly requested by the user.
Scope: orchestration cycle tasks #056–#058 (date distinguishes historical task numbers).

## Product decision

Connect the existing, verified talent boosts to the website before adding more
mechanics. A modelled effect and an unlocked effect are different facts. Never
call an entire constellation or character fully supported merely because one
talent boost works. Keep the existing authored support tier.

The global gate may open only for the reconciled talent-boost channel, after
live registry → configured team → website adapter → engine tests pass. The seven
other expressible effects must remain unsupported until separately wired and
verified. A blanket `support === modelled` check is insufficient.

## Character detail presentation

- Above the selector, when no effects are connected: `本角色的命之座效果尚未参与计算。层数选择会被保存。`
- When some effects are connected: `仅已建模且达到所选命座层数的效果参与计算；其余效果暂不计入。`
- Keep the existing total/modelled coverage counts. These count supported data,
  not effects currently active at C0. Use `未建模效果未计入，结果可能与实际表现不同。`
  rather than guaranteeing every missing mechanic lowers damage.
- Connected constellation rows show `已建模 · 已解锁` or `已建模 · 未解锁`,
  according to the selected level. This describes support and eligibility, not a
  promise that the current rotation uses that talent.
- Unconnected rows retain `尚未参与计算`. Missing Chinese prose remains a separate
  `暂无中文描述文本。` disclosure. Source prose can remain available.
- Do not promise automatic future activation of saved choices.

## Interaction and layout

Retain the seven-option radio group, one tab stop, visible focus, and current
selection. Implement Left/Right and Up/Down to move and select, wrapping at the
ends; Home/End select C0/C6. Tab leaves the group. Use full-width punctuation:
`选择命之座层数（当前：N 命）`.

Minimum target height 44px. Notices wrap without fixed height or line clamping.
Use existing semantic colours and pair status with text. Scope monospace to
numbers rather than whole Chinese labels. Keep the existing dialog scroll owner.

## Acceptance and review

1. C0 and an unlocked talent boost produce different damage through the website
   adapter for a relevant live character action; the non-target talent stays equal.
2. Changing a build preserves equipment, base stats, selected talents and identity.
3. A supported but locked row never says active; an unsupported modelled row never
   becomes simulated as a side effect of opening a global gate.
4. Keyboard selection updates checked state and focus together.
5. Review character detail at mobile width and 200% zoom for wrapping and focus.

Guidance: project DESIGN-SYSTEM (Chinese rules take precedence), and Vercel Web
Interface Guidelines fetched 2026-09-07. This is a scoped functional UI correction;
broader dashboard redesign remains a separate planning item.
