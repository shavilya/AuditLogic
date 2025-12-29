
import { Dexie, type Table } from 'dexie';
import { AuditSession } from '../types';

// The AuditDatabase class extends Dexie to provide a typed interface for our logic audit history.
export class AuditDatabase extends Dexie {
  audits!: Table<AuditSession>;

  constructor() {
    super('AuditLogicDB');
    // Defining the database schema using the versioning system.
    // Using this.version() correctly within the class constructor as defined in Dexie API.
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
