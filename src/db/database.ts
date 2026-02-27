import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "linkvault.db";

let db: SQLite.SQLiteDatabase | null = null;

// Default categories to seed - Inbox first (non-deletable), then others
const DEFAULT_CATEGORIES = [
  { name: "Inbox", isDeletable: 0 },
  { name: "Learn", isDeletable: 1 },
  { name: "Rewatch", isDeletable: 1 },
  { name: "Inspiration", isDeletable: 1 },
  { name: "Fitness", isDeletable: 1 },
  { name: "Career", isDeletable: 1 },
];

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
};

// Migration function to add isDeletable column if it doesn't exist
const runMigrations = async (
  database: SQLite.SQLiteDatabase,
): Promise<void> => {
  try {
    // Check if isDeletable column exists in categories table
    const tableInfo = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(categories)",
    );

    const columnNames = tableInfo.map((col) => col.name.toLowerCase());
    const hasIsDeletableColumn = columnNames.includes("isdeletable");

    if (!hasIsDeletableColumn) {
      // Add isDeletable column with default value of 1
      await database.execAsync(
        "ALTER TABLE categories ADD COLUMN isDeletable INTEGER DEFAULT 1",
      );
    }

    // Set Inbox to non-deletable (in case it was created with default 1)
    await database.runAsync(
      "UPDATE categories SET isDeletable = 0 WHERE name = 'Inbox'",
    );
  } catch (error) {
    console.error("[DB] Migration error:", error);
  }
};

export const initDatabase = async (): Promise<void> => {
  console.log("[DB] Starting database initialization...");
  const database = await getDatabase();
  console.log("[DB] Database opened, creating tables...");

  // Create categories table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      isDeletable INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );
  `);

  // Create links table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      domain TEXT NOT NULL,
      categoryId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Run migrations to ensure column exists
  await runMigrations(database);

  // Seed default categories if they don't exist (idempotent)
  const now = new Date().toISOString();

  for (const category of DEFAULT_CATEGORIES) {
    const existing = await database.getFirstAsync<{ id: number }>(
      "SELECT id FROM categories WHERE name = ?",
      [category.name],
    );

    if (!existing) {
      console.log(`[DB] Seeding category: ${category.name}`);
      await database.runAsync(
        "INSERT INTO categories (name, isDeletable, createdAt) VALUES (?, ?, ?)",
        [category.name, category.isDeletable, now],
      );
    } else {
      console.log(`[DB] Category already exists: ${category.name}`);
    }
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
