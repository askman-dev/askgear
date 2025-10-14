import Dexie, { type Table } from 'dexie';
import type { SolveInput } from '@features/recognize';

export class SolveHistoryDB extends Dexie {
  solves!: Table<SolveInput>;

  constructor() {
    super('SolveHistoryDB');
    this.version(1).stores({
      solves: 'id, timestamp', // Primary key 'id', and index 'timestamp' for sorting
    });
  }
}

export const db = new SolveHistoryDB();
