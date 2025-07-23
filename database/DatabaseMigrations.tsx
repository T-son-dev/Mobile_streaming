import SQLite from 'react-native-sqlite-storage';
import { SQL_SCHEMAS, DEFAULT_CATEGORIES } from './DatabaseSchema';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db: SQLite.SQLiteDatabase) => {
      // Create tables
      await db.executeSql(SQL_SCHEMAS.media_assets);
      await db.executeSql(SQL_SCHEMAS.categories);
      await db.executeSql(SQL_SCHEMAS.usage_analytics);
      
      // Create indexes
      for (const indexSql of SQL_SCHEMAS.indexes) {
        await db.executeSql(indexSql);
      }
      
      // Insert default categories
      for (const category of DEFAULT_CATEGORIES) {
        try {
          await db.executeSql(`
            INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)
          `, [category.name, category.color, category.icon]);
        } catch (error) {
          // Ignore duplicate key errors
          console.log(`Category ${category.name} already exists`);
        }
      }
    },
    down: async (db: SQLite.SQLiteDatabase) => {
      await db.executeSql('DROP TABLE IF EXISTS usage_analytics');
      await db.executeSql('DROP TABLE IF EXISTS categories');
      await db.executeSql('DROP TABLE IF EXISTS media_assets');
    }
  },
  
  {
    version: 2,
    name: 'add_asset_metadata_fields',
    up: async (db: SQLite.SQLiteDatabase) => {
      // Add new fields for enhanced metadata
      try {
        await db.executeSql(`
          ALTER TABLE media_assets ADD COLUMN hash TEXT;
        `);
        await db.executeSql(`
          ALTER TABLE media_assets ADD COLUMN thumbnail_path TEXT;
        `);
        await db.executeSql(`
          ALTER TABLE media_assets ADD COLUMN compressed_path TEXT;
        `);
        await db.executeSql(`
          CREATE INDEX IF NOT EXISTS idx_hash ON media_assets(hash);
        `);
      } catch (error) {
        console.log('Migration v2: Some columns may already exist');
      }
    },
    down: async (db: SQLite.SQLiteDatabase) => {
      // SQLite doesn't support DROP COLUMN, so we'd need to recreate the table
      console.log('Rollback for migration v2 not implemented (SQLite limitation)');
    }
  }
];

export class DatabaseMigrator {
  private db: SQLite.SQLiteDatabase;
  
  constructor(database: SQLite.SQLiteDatabase) {
    this.db = database;
  }
  
  async getCurrentVersion(): Promise<number> {
    try {
      // Create migration table if it doesn't exist
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      const result = await this.db.executeSql(
        'SELECT MAX(version) as current_version FROM migrations'
      );
      
      return result[0].rows.item(0).current_version || 0;
    } catch (error) {
      console.error('Error getting current migration version:', error);
      return 0;
    }
  }
  
  async runMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Running ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      try {
        console.log(`Running migration ${migration.version}: ${migration.name}`);
        
        // Begin transaction
        await this.db.executeSql('BEGIN TRANSACTION');
        
        // Run migration
        await migration.up(this.db);
        
        // Record migration
        await this.db.executeSql(`
          INSERT INTO migrations (version, name) VALUES (?, ?)
        `, [migration.version, migration.name]);
        
        // Commit transaction
        await this.db.executeSql('COMMIT');
        
        console.log(`Migration ${migration.version} completed successfully`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        
        // Rollback transaction
        try {
          await this.db.executeSql('ROLLBACK');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        
        throw error;
      }
    }
  }
  
  async rollbackToVersion(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    if (targetVersion >= currentVersion) {
      console.log('Nothing to rollback');
      return;
    }
    
    const migrationsToRollback = migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version); // Rollback in reverse order
    
    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        console.warn(`Migration ${migration.version} has no rollback function`);
        continue;
      }
      
      try {
        console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
        
        await this.db.executeSql('BEGIN TRANSACTION');
        await migration.down(this.db);
        await this.db.executeSql(
          'DELETE FROM migrations WHERE version = ?',
          [migration.version]
        );
        await this.db.executeSql('COMMIT');
        
        console.log(`Migration ${migration.version} rolled back successfully`);
      } catch (error) {
        console.error(`Rollback of migration ${migration.version} failed:`, error);
        
        try {
          await this.db.executeSql('ROLLBACK');
        } catch (rollbackError) {
          console.error('Rollback transaction failed:', rollbackError);
        }
        
        throw error;
      }
    }
  }
  
  async resetDatabase(): Promise<void> {
    console.log('Resetting database - dropping all tables');
    
    try {
      await this.db.executeSql('BEGIN TRANSACTION');
      
      // Drop all tables in reverse dependency order
      await this.db.executeSql('DROP TABLE IF EXISTS usage_analytics');
      await this.db.executeSql('DROP TABLE IF EXISTS categories');
      await this.db.executeSql('DROP TABLE IF EXISTS media_assets');
      await this.db.executeSql('DROP TABLE IF EXISTS migrations');
      
      await this.db.executeSql('COMMIT');
      
      // Run all migrations from scratch
      await this.runMigrations();
      
      console.log('Database reset completed');
    } catch (error) {
      console.error('Database reset failed:', error);
      
      try {
        await this.db.executeSql('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      
      throw error;
    }
  }
}