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
    // In production builds (especially with New Architecture / JSI), the native
    // bridge can silently drop the connection. Probe it before returning.
    try {
      await db.getFirstAsync("SELECT 1");
      return db;
    } catch (e) {
      console.warn("[DB] Cached connection is stale, reinitializing...", e);
      db = null;
    }
  }

  console.log("[DB] Opening database...");
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // WAL mode prevents locking issues that only surface under production timing.
  await db.execAsync("PRAGMA journal_mode = WAL;");
  // Enforce foreign key constraints (SQLite disables them by default).
  await db.execAsync("PRAGMA foreign_keys = ON;");

  console.log("[DB] Database opened with WAL mode and FK support.");
  return db;
};

const runMigrations = async (
  database: SQLite.SQLiteDatabase,
): Promise<void> => {
  try {
    console.log("[DB] Running migrations...");

    const tableInfo = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(categories)",
    );

    const columnNames = tableInfo.map((col) => col.name.toLowerCase());
    const hasIsDeletableColumn = columnNames.includes("isdeletable");
    const hasParentIdColumn = columnNames.includes("parent_id");

    if (!hasIsDeletableColumn) {
      console.log("[DB] Adding isDeletable column...");
      await database.execAsync(
        "ALTER TABLE categories ADD COLUMN isDeletable INTEGER DEFAULT 1",
      );
    }

    // Add parent_id column for subcategories support
    if (!hasParentIdColumn) {
      console.log("[DB] Adding parent_id column...");
      await database.execAsync(
        "ALTER TABLE categories ADD COLUMN parent_id INTEGER",
      );
    }

    // Ensure Inbox is always non-deletable
    await database.runAsync(
      "UPDATE categories SET isDeletable = 0 WHERE name = 'Inbox'",
    );

    console.log("[DB] Migrations complete.");
  } catch (error) {
    console.error("[DB] Migration error:", error);
    throw error;
  }
};

export const initDatabase = async (): Promise<void> => {
  console.log("[DB] Starting database initialization...");
  const database = await getDatabase();

  try {
    // Categories table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        isDeletable INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL
      );
    `);
    console.log("[DB] categories table ready.");

    // Links table
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
    console.log("[DB] links table ready.");

    // Settings table — MUST be created here before ThemeProvider mounts,
    // otherwise ThemeContext queries a non-existent table and the whole
    // provider tree crashes or hangs on isLoading forever.
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log("[DB] settings table ready.");

    await runMigrations(database);

    // Seed default categories (idempotent)
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
      }
    }

    // Seed default subcategories (idempotent)
    const DEFAULT_SUBCATEGORIES = [
      { name: "YouTube", parentName: "Learn" },
      { name: "Articles", parentName: "Learn" },
      { name: "Courses", parentName: "Learn" },
      { name: "Videos", parentName: "Rewatch" },
      { name: "Podcasts", parentName: "Rewatch" },
      { name: "Design", parentName: "Inspiration" },
      { name: "UI/UX", parentName: "Inspiration" },
      { name: "Workouts", parentName: "Fitness" },
      { name: "Nutrition", parentName: "Fitness" },
      { name: "Resume", parentName: "Career" },
      { name: "Jobs", parentName: "Career" },
    ];

    for (const subcategory of DEFAULT_SUBCATEGORIES) {
      const existingSub = await database.getFirstAsync<{ id: number }>(
        "SELECT id FROM categories WHERE name = ?",
        [subcategory.name],
      );

      if (!existingSub) {
        const parent = await database.getFirstAsync<{ id: number }>(
          "SELECT id FROM categories WHERE name = ?",
          [subcategory.parentName],
        );

        if (parent) {
          console.log(
            `[DB] Seeding subcategory: ${subcategory.name} under ${subcategory.parentName}`,
          );
          await database.runAsync(
            "INSERT INTO categories (name, isDeletable, createdAt, parent_id) VALUES (?, ?, ?, ?)",
            [subcategory.name, 1, now, parent.id],
          );
        }
      }
    }

    console.log("[DB] Database initialization complete.");
  } catch (error) {
    console.error("[DB] Error during table creation or seeding:", error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    console.log("[DB] Closing database...");
    await db.closeAsync();
    db = null;
  }
};
