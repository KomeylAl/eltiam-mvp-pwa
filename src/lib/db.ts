import Dexie, { Table } from "dexie";

export interface Measurement {
  id?: number;
  user_id: number;
  user_name: string;
  date: string;
  time: string;
  q_number: number;
  a_number: number;
  synced: number;
}

export interface Intervention extends Measurement {}
export interface WordGame {
  id?: number;
  user_id: number;
  user_name: string;
  point: number;
  date: string;
  time: string;
  synced: number;
}

export interface SocialProblem {
  id?: number;
  user_id: number;
  user_name: string;
  problem: string;
  reason: string;
  solutions: string;
  evaluations: string;
  bestindex: string;
  plan: string;
  date: string;
  time: string;
  synced: number;
}

export interface SafetyPlan {
  id?: number;
  user_id: number;
  user_name: string;
  question_one: number;
  question_tow: number;
  thinking_feelings: string;
  self_help: string;
  others_help: string;
  close_people_list: string;
  close_friends_thoughts: string;
  phone_calls: string;
  protected_places: string;
  date: string;
  time: string;
  synced: number;
}

export class AppDatabase extends Dexie {
  measurements!: Table<Measurement, number>;
  interventions!: Table<Intervention, number>;
  word_game!: Table<WordGame, number>;
  social_problem!: Table<SocialProblem, number>;
  safety_plan!: Table<SafetyPlan, number>;

  constructor() {
    super("eltiamDB");

    this.version(1).stores({
      measurements: "++id, user_id, synced",
      interventions: "++id, user_id, synced",
      word_game: "++id, user_id, synced",
      social_problem: "++id, user_id, synced",
      safety_plan: "++id, user_id, synced",
    });
  }
}

export const db = new AppDatabase();
