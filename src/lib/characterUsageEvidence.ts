/**
 * Conservative extraction of combat-usage facts from the sourced talent text.
 *
 * This is deliberately an evidence parser, not a character-mechanics engine.
 * It only emits facts when the text uses an explicit phrase. In particular,
 * "再次施放" is a recast/state-ending signal, not a second charge, and stack
 * counts such as "至多持有3枚" are not skill charges.
 */

export type TalentUsageSlot = "normal" | "skill" | "burst";

export interface UsageEvidenceQuote {
  readonly text: string;
  readonly confidence: "explicit";
}

export interface AdditionalSkillUseEvidence {
  readonly count: number;
  readonly condition: UsageEvidenceQuote;
}

export interface AlternateResourceEvidence {
  readonly resourceName: string;
  readonly minimum?: {
    readonly amount: number;
    readonly unit: "points" | "percent";
    readonly evidence: UsageEvidenceQuote;
  };
  readonly consumesAll: boolean;
  readonly zeroCostVariant: boolean;
  readonly gains: readonly number[];
  readonly evidence: readonly UsageEvidenceQuote[];
}

export interface TalentUsageEvidence {
  readonly inputVariants: "tap-hold" | "single";
  readonly canRecast: boolean;
  readonly initialCharges?: {
    readonly count: number;
    readonly evidence: UsageEvidenceQuote;
  };
  readonly additionalUses: readonly AdditionalSkillUseEvidence[];
  readonly alternateResource?: AlternateResourceEvidence;
}

export interface ResourceGainEvidence {
  readonly amount: number;
  readonly evidence: UsageEvidenceQuote;
}

export type CharacterUsageEvidence = Partial<
  Record<TalentUsageSlot, TalentUsageEvidence>
>;

function quote(text: string, start: number, end: number): UsageEvidenceQuote {
  const left = Math.max(0, start - 18);
  const right = Math.min(text.length, end + 18);
  return {
    text: text.slice(left, right).replace(/\s+/g, " ").trim(),
    confidence: "explicit",
  };
}

function normalize(text: string): string {
  return text.replace(/\*\*/g, "").replace(/[「」]/g, "");
}

function numberFromChinese(value: string): number | undefined {
  if (/^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value === "一") return 1;
  if (value === "两") return 2;
  return undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseAlternateResource(text: string): AlternateResourceEvidence | undefined {
  const resourceMatch = text.match(
    /元素爆发不依靠元素能量，而是依靠([^。\n，]+)/,
  );
  if (!resourceMatch?.[1]) return undefined;

  const resourceName = resourceMatch[1].trim();
  const evidence: UsageEvidenceQuote[] = [
    quote(text, resourceMatch.index ?? 0, (resourceMatch.index ?? 0) + resourceMatch[0].length),
  ];
  const resourcePattern = escapeRegExp(resourceName);
  const minimumMatch = text.match(
    new RegExp(
      `拥有至少(\\d+(?:\\.\\d+)?)(%|点)?${resourcePattern}时`,
    ),
  );
  const minimumAmount = minimumMatch?.[1]
    ? Number(minimumMatch[1])
    : undefined;
  const minimum =
    minimumMatch !== null && minimumAmount !== undefined
      ? {
          amount: minimumAmount,
          unit: minimumMatch[2] === "%" ? ("percent" as const) : ("points" as const),
          evidence: quote(
            text,
            minimumMatch.index ?? 0,
            (minimumMatch.index ?? 0) + minimumMatch[0].length,
          ),
        }
      : undefined;
  if (minimum !== undefined) evidence.push(minimum.evidence);

  const consumeMatch = text.match(new RegExp(`消耗所有${resourcePattern}`));
  if (consumeMatch !== null) {
    evidence.push(
      quote(text, consumeMatch.index ?? 0, (consumeMatch.index ?? 0) + consumeMatch[0].length),
    );
  }

  const zeroCostMatch = text.match(new RegExp(`无需消耗${resourcePattern}即可施放`));
  if (zeroCostMatch !== null) {
    evidence.push(
      quote(text, zeroCostMatch.index ?? 0, (zeroCostMatch.index ?? 0) + zeroCostMatch[0].length),
    );
  }

  const gains: number[] = [];
  const gainPattern = new RegExp(`获得(\\d+(?:\\.\\d+)?)点${resourcePattern}`, "g");
  for (const match of text.matchAll(gainPattern)) {
    const amount = Number(match[1]);
    if (!Number.isFinite(amount)) continue;
    if (!gains.includes(amount)) gains.push(amount);
  }

  return {
    resourceName,
    ...(minimum !== undefined ? { minimum } : {}),
    consumesAll: consumeMatch !== null,
    zeroCostVariant: zeroCostMatch !== null,
    gains,
    evidence,
  };
}

/** Find gains for a resource whose name was established by another talent. */
export function parseResourceGainEvidence(
  description: string,
  resourceName: string,
): readonly ResourceGainEvidence[] {
  const text = normalize(description);
  const resourcePattern = escapeRegExp(resourceName);
  const gainPattern = new RegExp(`获得(\\d+(?:\\.\\d+)?)点${resourcePattern}`, "g");
  const gains: ResourceGainEvidence[] = [];
  for (const match of text.matchAll(gainPattern)) {
    const amount = Number(match[1]);
    if (!Number.isFinite(amount)) continue;
    gains.push({
      amount,
      evidence: quote(
        text,
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      ),
    });
  }
  return gains;
}

/** Parse only explicit, reviewable usage signals from one talent description. */
export function parseTalentUsageEvidence(description: string): TalentUsageEvidence {
  const text = normalize(description);
  const inputVariants =
    text.includes("点按") && text.includes("长按") ? "tap-hold" : "single";
  const canRecast = /再次施放(?:元素战技|技能)?/.test(text);

  const chargesMatch = text.match(/(?:初始)?拥有(\d+)次可(?:使用|用)次数/);
  const initialCharges =
    chargesMatch?.[1] !== undefined
      ? {
          count: Number(chargesMatch[1]),
          evidence: quote(
            text,
            chargesMatch.index ?? 0,
            (chargesMatch.index ?? 0) + chargesMatch[0].length,
          ),
        }
      : undefined;

  const additionalUses: AdditionalSkillUseEvidence[] = [];
  const additionalPattern = /额外获得(一|\d+)次[^。；\n]{0,80}?可(?:使用|用)次数/g;
  for (const match of text.matchAll(additionalPattern)) {
    const count = numberFromChinese(match[1] ?? "");
    if (count === undefined) continue;
    additionalUses.push({
      count,
      condition: quote(
        text,
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      ),
    });
  }

  const alternateResource = parseAlternateResource(text);
  return {
    inputVariants,
    canRecast,
    ...(initialCharges !== undefined ? { initialCharges } : {}),
    additionalUses,
    ...(alternateResource !== undefined ? { alternateResource } : {}),
  };
}
