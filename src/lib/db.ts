import Dexie, { type Table } from 'dexie';
import type { SolveInput } from '@features/recognize';
import type { ProviderSetting } from '@features/settings/types';

export class SolveHistoryDB extends Dexie {
  solves!: Table<SolveInput>;
  providerSettings!: Table<ProviderSetting, string>;

  constructor() {
    super('SolveHistoryDB');
    this.version(2).stores({
      solves: 'id, timestamp',
      providerSettings: 'id, isActive, isBuiltIn',
    });
  }
}

export const db = new SolveHistoryDB();
