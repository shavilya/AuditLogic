
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { AuditSession } from '../types';

export class AuditDatabase extends Dexie {
  audits!: Table<AuditSession>;

  constructor() {
    super('AuditLogicDB');
    // Defining the database schema using the versioning system.
    // Fix: Using named import for Dexie class to ensure inherited methods like 'version' are correctly recognized by the TypeScript compiler.
    this.version(1).stores({
      audits: 'id, timestamp' 
    });
  }

  async saveAudit(audit: AuditSession) {
    return await this.audits.add(audit);
  }

  async getAllAudits() {
    return await this.audits
      .orderBy('timestamp')
      .reverse()
      .toArray();
  }

  async clearAllAudits() {
    return await this.audits.clear();
  }
}

export const db = new AuditDatabase();
