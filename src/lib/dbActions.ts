import toast from "react-hot-toast";
import { db } from "./db";
import { useCallback, useState } from "react";
import {
  type ActivationSlot,
  isRecordInSlot,
} from "@/utils/schedule";

// ---------- INSERTS ---------- //

async function isQuestionnaireSlotSubmitted(
  table: "measurements" | "interventions",
  slot: ActivationSlot,
  date: string
): Promise<boolean> {
  const records: { date: string; time: string; q_number: number }[] =
    await db[table].where("date").equals(date).toArray();

  const inSlot = records.filter((r) => isRecordInSlot(r.time, slot));
  const answered = new Set(inSlot.map((r) => r.q_number));
  return answered.size >= 3;
}

export async function isMeasurementSlotSubmitted(
  slot: ActivationSlot,
  date: string
): Promise<boolean> {
  return isQuestionnaireSlotSubmitted("measurements", slot, date);
}

export async function isInterventionSlotSubmitted(
  slot: ActivationSlot,
  date: string
): Promise<boolean> {
  return isQuestionnaireSlotSubmitted("interventions", slot, date);
}

export async function insertMeasurementsBatch(
  items: Record<string, unknown>[]
): Promise<void> {
  await db.transaction("rw", db.measurements, async () => {
    for (const item of items) {
      await db.measurements.add({ ...item, synced: 0 } as never);
    }
  });
  scheduleAutoSync();
}

export async function insertInterventionsBatch(
  items: Record<string, unknown>[]
): Promise<void> {
  await db.transaction("rw", db.interventions, async () => {
    for (const item of items) {
      await db.interventions.add({ ...item, synced: 0 } as never);
    }
  });
  scheduleAutoSync();
}

export async function insertMeasurement(data: Record<string, unknown>) {
  await db.measurements.add({ ...data, synced: 0 } as never);
  scheduleAutoSync();
}

export async function insertIntervention(data: Record<string, unknown>) {
  await db.interventions.add({ ...data, synced: 0 } as never);
  scheduleAutoSync();
}

export async function insertSocialProblem(data: Record<string, unknown>) {
  await db.social_problem.add({ ...data, synced: 0 } as never);
  scheduleAutoSync();
}

export async function insertWordGame(data: Record<string, unknown>) {
  await db.word_game.add({ ...data, synced: 0 } as never);
  scheduleAutoSync();
}

export async function insertSafetyPlan(data: Record<string, unknown>) {
  await db.safety_plan.add({ ...data, synced: 0 } as never);
  scheduleAutoSync();
}

// ---------- SYNC HELPERS ---------- //

function pickMeasurementFields(record: Record<string, unknown>) {
  return {
    date: record.date,
    time: record.time,
    q_number: record.q_number,
    a_number: record.a_number,
  };
}

function pickSocialProblemFields(record: Record<string, unknown>) {
  return {
    problem: record.problem,
    reason: record.reason ?? "",
    solutions: record.solutions ?? "",
    evaluations: record.evaluations ?? "",
    bestindex:
      record.bestindex !== undefined && record.bestindex !== ""
        ? Number(record.bestindex)
        : undefined,
    plan: record.plan ?? "",
    date: record.date,
    time: record.time,
  };
}

function pickWordGameFields(record: Record<string, unknown>) {
  return {
    point: record.point,
    date: record.date,
    time: record.time,
  };
}

function pickSafetyPlanFields(record: Record<string, unknown>) {
  return {
    question_one: record.question_one != null ? String(record.question_one) : "",
    question_two: record.question_tow != null ? String(record.question_tow) : "",
    thinking_feelings: record.thinking_feelings ?? "",
    self_help: record.self_help ?? "",
    others_help: record.others_help ?? "",
    close_people_list: record.close_people_list ?? "",
    close_friends_thoughts: record.close_friends_thoughts ?? "",
    phone_calls: record.phone_calls ?? "",
    protected_places: record.protected_places ?? "",
    date: record.date,
    time: record.time,
  };
}

const syncTables: {
  table: string;
  syncType: string;
  mapFields: (record: Record<string, unknown>) => Record<string, unknown>;
}[] = [
  {
    table: "measurements",
    syncType: "measurements",
    mapFields: pickMeasurementFields,
  },
  {
    table: "interventions",
    syncType: "interventions",
    mapFields: pickMeasurementFields,
  },
  {
    table: "social_problem",
    syncType: "social-problems",
    mapFields: pickSocialProblemFields,
  },
  {
    table: "word_game",
    syncType: "word-games",
    mapFields: pickWordGameFields,
  },
  {
    table: "safety_plan",
    syncType: "safety-plans",
    mapFields: pickSafetyPlanFields,
  },
];

export type SyncResult = {
  allSynced: boolean;
  hasSyncedAnything: boolean;
  skippedOffline: boolean;
};

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInProgress = false;
let syncQueued = false;

const AUTO_SYNC_DELAY_MS = 3000;

/** Debounced auto-sync after local saves (batches rapid form answers). */
export function scheduleAutoSync(): void {
  if (typeof window === "undefined") return;

  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => {
    autoSyncTimer = null;
    void syncWithServer({ silent: true });
  }, AUTO_SYNC_DELAY_MS);
}

export async function syncWithServer(options?: {
  silent?: boolean;
}): Promise<SyncResult> {
  const silent = options?.silent ?? false;

  if (typeof window === "undefined") {
    return { allSynced: true, hasSyncedAnything: false, skippedOffline: false };
  }

  if (!navigator.onLine) {
    return { allSynced: true, hasSyncedAnything: false, skippedOffline: true };
  }

  if (syncInProgress) {
    syncQueued = true;
    return { allSynced: true, hasSyncedAnything: false, skippedOffline: false };
  }

  syncInProgress = true;
  let allSyncedLocal = true;
  let hasSyncedAnything = false;

  try {
    for (const { table, syncType, mapFields } of syncTables) {
      // @ts-expect-error dynamic table access
      const unsynced: { id?: number; [key: string]: unknown }[] = await db[
        table
      ]
        .where("synced")
        .equals(0)
        .toArray();

      if (unsynced.length === 0) continue;

      const syncedIds = unsynced
        .map((record) => record.id)
        .filter((id): id is number => id != null);

      const payload = unsynced.map((record) =>
        mapFields(record as Record<string, unknown>)
      );

      try {
        const res = await fetch(`/api/sync/${syncType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payload }),
        });

        if (res.ok) {
          // Only mark records that were actually sent in this batch
          // @ts-expect-error dynamic table access
          await db[table].bulkUpdate(
            syncedIds.map((id) => ({ key: id, changes: { synced: 1 } }))
          );
          hasSyncedAnything = true;
        } else if (res.status === 401) {
          allSyncedLocal = false;
          if (!silent) {
            toast.error("نشست شما منقضی شده. لطفاً دوباره وارد شوید.");
          }
          break;
        } else {
          allSyncedLocal = false;
          if (!silent) toast.error(`خطا در همگام‌سازی ${table}`);
        }
      } catch (err) {
        allSyncedLocal = false;
        console.error(`Sync error for ${table}:`, err);
        if (!silent) toast.error(`خطا در همگام‌سازی ${table}`);
      }
    }

    if (!silent) {
      if (hasSyncedAnything && allSyncedLocal) {
        toast.success("تمامی اطلاعات با موفقیت همگام‌سازی شدند.");
      } else if (!hasSyncedAnything && allSyncedLocal) {
        toast.success("همه اطلاعات قبلاً همگام‌سازی شده‌اند.");
      }
    }
  } finally {
    syncInProgress = false;
    if (syncQueued) {
      syncQueued = false;
      void syncWithServer(options);
    }
  }

  return {
    allSynced: allSyncedLocal,
    hasSyncedAnything,
    skippedOffline: false,
  };
}

/** Reset sync flags so all local records can be re-sent (use if data was lost). */
export async function resetAllSyncFlags(): Promise<void> {
  for (const { table } of syncTables) {
    // @ts-expect-error dynamic table access
    await db[table].toCollection().modify({ synced: 0 });
  }
}

export async function forceResyncAll(options?: {
  silent?: boolean;
}): Promise<SyncResult> {
  await resetAllSyncFlags();
  return syncWithServer(options);
}

export function useSyncWithServer() {
  const [isLoading, setIsLoading] = useState(false);
  const [allSynced, setAllSynced] = useState(true);

  const sync = useCallback(async () => {
    setIsLoading(true);
    const result = await syncWithServer({ silent: false });
    setAllSynced(result.allSynced);
    setIsLoading(false);
  }, []);

  const forceResync = useCallback(async () => {
    setIsLoading(true);
    const result = await forceResyncAll({ silent: false });
    setAllSynced(result.allSynced);
    setIsLoading(false);
  }, []);

  return { sync, forceResync, isLoading, allSynced };
}
