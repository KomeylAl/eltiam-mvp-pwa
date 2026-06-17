import toast from "react-hot-toast";
import { db } from "./db";
import { useState } from "react";

const BASE_URL = "https://soheil.ebrazclinic.ir/api";

// ---------- INSERTS ---------- //

export async function insertMeasurement(data: any) {
  await db.measurements.add({ ...data, synced: 0 });
}

export async function insertIntervention(data: any) {
  await db.interventions.add({ ...data, synced: 0 });
}

export async function insertSocialProblem(data: any) {
  await db.social_problem.add({ ...data, synced: 0 });
}

export async function insertWordGame(data: any) {
  await db.word_game.add({ ...data, synced: 0 });
}

export async function insertSafetyPlan(data: any) {
  await db.safety_plan.add({ ...data, synced: 0 });
}

// ---------- SYNC ---------- //

const syncTables = [
  { table: "measurements", endpoint: "/measurements" },
  { table: "word_game", endpoint: "/wordgames" },
  { table: "interventions", endpoint: "/interventions" },
  { table: "social_problem", endpoint: "/socialproblems" },
  { table: "safety_plan", endpoint: "/safetyplans" },
];

export function useSyncWithServer() {
  const [isLoading, setIsLoading] = useState(false);
  const [allSynced, setAllSynced] = useState(true);

  
  const sync = async () => {
    setIsLoading(true);
    let allSyncedLocal = true;
    const data = db.measurements;
    console.log(await data.count())

    for (const { table, endpoint } of syncTables) {
      // @ts-ignore
      const unsynced = await db[table].where("synced").equals(0).toArray();
      if (unsynced.length === 0) {
        continue;
      };

      try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: unsynced }),
        });

        if (res.ok) {
          // @ts-ignore
          await db[table].where("synced").equals(0).modify({ synced: 1 });
          console.log(await res.json())
          // toast.success(`✅ Sync success for ${table}`);
        } else {
          allSyncedLocal = false;
          toast.error(`❌ Sync failed for ${table}`);
        }
      } catch (err) {
        allSyncedLocal = false;
        console.error(`❌ Sync error for ${table}:`, err);
        toast.error(`❌ Sync error for ${table}`);
      }
    }

    if (allSynced) toast.success("تمامی اطلاعات همگام‌سازی شده اند.")

    setAllSynced(allSyncedLocal);
    setIsLoading(false);
  };

  return { sync, isLoading, allSynced };
}