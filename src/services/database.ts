import * as SQLite from 'expo-sqlite';
import { Contact } from '../models/Contact';

const DATABASE_NAME = 'core_memory.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        photoUri TEXT,
        contextNotes TEXT,
        mnemonicHook TEXT,
        lastReviewDate TEXT NOT NULL,
        nextReviewDate TEXT NOT NULL,
        easinessFactor REAL NOT NULL DEFAULT 2.5,
        repetitionCount INTEGER DEFAULT 0,
        intervalDays INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_nextReviewDate ON contacts(nextReviewDate);
      CREATE INDEX IF NOT EXISTS idx_name ON contacts(name);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Create a new contact
 */
export async function createContact(contact: Contact): Promise<void> {
  const database = getDB();

  await database.runAsync(
    `INSERT INTO contacts (
      id, name, photoUri, contextNotes, mnemonicHook,
      lastReviewDate, nextReviewDate, easinessFactor,
      repetitionCount, intervalDays
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      contact.id,
      contact.name,
      contact.photoUri || '',
      contact.contextNotes || '',
      contact.mnemonicHook || '',
      contact.lastReviewDate,
      contact.nextReviewDate,
      contact.easinessFactor,
      contact.repetitionCount || 0,
      contact.intervalDays || 0,
    ]
  );
}

/**
 * Get all contacts
 */
export async function getAllContacts(): Promise<Contact[]> {
  const database = getDB();

  const result = await database.getAllAsync<Contact>(
    'SELECT * FROM contacts ORDER BY name ASC'
  );

  return result;
}

/**
 * Search contacts by name
 */
export async function searchContacts(query: string): Promise<Contact[]> {
  const database = getDB();

  const result = await database.getAllAsync<Contact>(
    'SELECT * FROM contacts WHERE name LIKE ? ORDER BY name ASC',
    [`%${query}%`]
  );

  return result;
}

/**
 * Get a single contact by ID
 */
export async function getContactById(id: string): Promise<Contact | null> {
  const database = getDB();

  const result = await database.getFirstAsync<Contact>(
    'SELECT * FROM contacts WHERE id = ?',
    [id]
  );

  return result || null;
}

/**
 * Update an existing contact
 */
export async function updateContact(contact: Contact): Promise<void> {
  const database = getDB();

  await database.runAsync(
    `UPDATE contacts SET
      name = ?,
      photoUri = ?,
      contextNotes = ?,
      mnemonicHook = ?,
      lastReviewDate = ?,
      nextReviewDate = ?,
      easinessFactor = ?,
      repetitionCount = ?,
      intervalDays = ?
    WHERE id = ?`,
    [
      contact.name,
      contact.photoUri || '',
      contact.contextNotes || '',
      contact.mnemonicHook || '',
      contact.lastReviewDate,
      contact.nextReviewDate,
      contact.easinessFactor,
      contact.repetitionCount || 0,
      contact.intervalDays || 0,
      contact.id,
    ]
  );
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<void> {
  const database = getDB();

  await database.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
}

/**
 * Get contacts due for review (nextReviewDate <= today)
 */
export async function getContactsDueForReview(): Promise<Contact[]> {
  const database = getDB();

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const todayStr = today.toISOString();

  const result = await database.getAllAsync<Contact>(
    'SELECT * FROM contacts WHERE nextReviewDate <= ? ORDER BY nextReviewDate ASC',
    [todayStr]
  );

  return result;
}

/**
 * Get count of contacts due for review
 */
export async function getReviewCount(): Promise<number> {
  const database = getDB();

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const todayStr = today.toISOString();

  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM contacts WHERE nextReviewDate <= ?',
    [todayStr]
  );

  return result?.count || 0;
}
