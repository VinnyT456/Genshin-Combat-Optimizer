import type {
  CharacterState,
  CombatEvent,
  HealingEvent,
  PickupEvent,
  ResourceEvent,
} from "@/types";

/** Apply a deterministic HP restoration and return its timeline record. */
export function applyHealingEvent(
  states: ReadonlyMap<string, CharacterState>,
  event: HealingEvent,
): CombatEvent | undefined {
  const targetId = event.targetCharacterId ?? event.sourceCharacterId;
  const target = states.get(targetId);
  if (target === undefined || target.currentHp === undefined) return undefined;
  const maxHp = target.maxHp ?? target.currentHp;
  const amount = Math.max(0, Number.isFinite(event.amount) ? event.amount : 0);
  const restored = Math.min(amount, Math.max(0, maxHp - target.currentHp));
  target.currentHp = Math.min(maxHp, target.currentHp + amount);
  return {
    timestamp: event.timestamp,
    type: "healing",
    characterId: targetId,
    description: `${target.definition.name} restores ${restored} HP`,
    healing: { ...event, targetCharacterId: targetId, amount: restored },
  };
}

/** Convert a pickup into a stable event record without changing state. */
export function pickupEventRecord(event: PickupEvent): CombatEvent {
  return {
    timestamp: event.timestamp,
    type: "pickup",
    characterId: event.targetCharacterId ?? event.sourceCharacterId,
    description: `${event.kind} pickup`,
    pickup: { ...event },
  };
}

/** Convert a resource transition into a stable event record without IO. */
export function resourceEventRecord(event: ResourceEvent): CombatEvent {
  return {
    timestamp: event.timestamp,
    type: "resource",
    characterId: event.sourceCharacterId,
    description: `${event.resourceId} ${event.kind}`,
    resource: { ...event },
  };
}
