import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

export interface MediaAsset {
  id?: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  format: string;
  width?: number;
  height?: number;
  created_at: string;
  last_used?: string;
  usage_count: number;
  category?: string;
  tags?: string;
  is_favorite: boolean;
}

export interface Category {
  id?: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface UsageAnalytic {
  id?: number;
  asset_id: number;
  action: 'view' | 'use' | 'edit';
  timestamp: string;
}

class AssetDatabase {
  private database: SQLite.SQLiteDatabase | null = null;
  private readonly databaseName = 'media_library.db';
  private readonly databaseVersion = '1.0';
  private readonly databaseDisplayName = 'Media Library Database';
  private readonly databaseSize = 200000;

  async initDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (this.database) {
      return this.database;
    }

    try {
      this.database = await SQLite.openDatabase({
        name: this.databaseName,
        version: this.databaseVersion,
        displayName: this.databaseDisplayName,
        size: this.databaseSize,
      });

      await this.createTables();
      await this.seedDefaultCategories();
      
      console.log('Database initialized successfully');
      return this.database;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    // Create media_assets table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        format TEXT,
        width INTEGER,
        height INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME,
        usage_count INTEGER DEFAULT 0,
        category TEXT,
        tags TEXT,
        is_favorite BOOLEAN DEFAULT 0
      );
    `);

    // Create categories table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        color TEXT,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create usage_analytics table
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS usage_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER,
        action TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES media_assets(id)
      );
    `);

    // Create indexes for better performance
    await this.database.executeSql('CREATE INDEX IF NOT EXISTS idx_filename ON media_assets(filename);');
    await this.database.executeSql('CREATE INDEX IF NOT EXISTS idx_category ON media_assets(category);');
    await this.database.executeSql('CREATE INDEX IF NOT EXISTS idx_created_at ON media_assets(created_at);');
    await this.database.executeSql('CREATE INDEX IF NOT EXISTS idx_last_used ON media_assets(last_used);');
  }

  private async seedDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: 'Logos', color: '#4F46E5', icon: 'logo' },
      { name: 'Overlays', color: '#059669', icon: 'layers' },
      { name: 'Backgrounds', color: '#DC2626', icon: 'image' },
      { name: 'Screenshots', color: '#7C2D12', icon: 'camera' },
      { name: 'Custom', color: '#6B7280', icon: 'folder' }
    ];

    for (const category of defaultCategories) {
      try {
        await this.insertCategory(category);
      } catch (error) {
        // Category might already exist, ignore duplicate errors
        console.log(`Category ${category.name} already exists`);
      }
    }
  }

  // Media Assets CRUD operations
  async insertAsset(asset: Omit<MediaAsset, 'id' | 'created_at'>): Promise<number> {
    if (!this.database) {
      await this.initDatabase();
    }

    const result = await this.database!.executeSql(`
      INSERT INTO media_assets (
        filename, original_name, file_path, file_size, format, 
        width, height, usage_count, category, tags, is_favorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      asset.filename, asset.original_name, asset.file_path, asset.file_size,
      asset.format, asset.width || null, asset.height || null,
      asset.usage_count, asset.category || null, asset.tags || null,
      asset.is_favorite ? 1 : 0
    ]);

    return result[0].insertId;
  }

  async getAssets(filter?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<MediaAsset[]> {
    if (!this.database) {
      await this.initDatabase();
    }

    let query = 'SELECT * FROM media_assets WHERE 1=1';
    const params: any[] = [];

    if (filter?.category) {
      query += ' AND category = ?';
      params.push(filter.category);
    }

    if (filter?.search) {
      query += ' AND (filename LIKE ? OR original_name LIKE ? OR tags LIKE ?)';
      const searchParam = `%${filter.search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY last_used DESC, created_at DESC';

    if (filter?.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
      
      if (filter?.offset) {
        query += ' OFFSET ?';
        params.push(filter.offset);
      }
    }

    const result = await this.database!.executeSql(query, params);
    const assets: MediaAsset[] = [];

    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      assets.push({
        ...row,
        is_favorite: Boolean(row.is_favorite)
      });
    }

    return assets;
  }

  async updateAsset(id: number, updates: Partial<MediaAsset>): Promise<void> {
    if (!this.database) {
      await this.initDatabase();
    }

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === 'is_favorite' ? (value ? 1 : 0) : value);
      }
    });

    if (fields.length === 0) return;

    values.push(id);
    await this.database!.executeSql(
      `UPDATE media_assets SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteAsset(id: number): Promise<void> {
    if (!this.database) {
      await this.initDatabase();
    }

    await this.database!.executeSql('DELETE FROM media_assets WHERE id = ?', [id]);
    await this.database!.executeSql('DELETE FROM usage_analytics WHERE asset_id = ?', [id]);
  }

  async incrementUsageCount(id: number): Promise<void> {
    await this.updateAsset(id, {
      usage_count: 0, // This will be incremented by SQL
      last_used: new Date().toISOString()
    });

    if (!this.database) {
      await this.initDatabase();
    }

    await this.database!.executeSql(
      'UPDATE media_assets SET usage_count = usage_count + 1 WHERE id = ?',
      [id]
    );
  }

  // Categories CRUD operations
  async insertCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    if (!this.database) {
      await this.initDatabase();
    }

    const result = await this.database!.executeSql(`
      INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)
    `, [category.name, category.color || null, category.icon || null]);

    return result[0].insertId;
  }

  async getCategories(): Promise<Category[]> {
    if (!this.database) {
      await this.initDatabase();
    }

    const result = await this.database!.executeSql(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    const categories: Category[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      categories.push(result[0].rows.item(i));
    }

    return categories;
  }

  // Analytics operations
  async logUsage(assetId: number, action: UsageAnalytic['action']): Promise<void> {
    if (!this.database) {
      await this.initDatabase();
    }

    await this.database!.executeSql(`
      INSERT INTO usage_analytics (asset_id, action) VALUES (?, ?)
    `, [assetId, action]);

    // Also increment usage count
    await this.incrementUsageCount(assetId);
  }

  async getStorageStats(): Promise<{
    totalAssets: number;
    totalSize: number;
    categoryBreakdown: { category: string; count: number; size: number }[];
    recentActivity: UsageAnalytic[];
  }> {
    if (!this.database) {
      await this.initDatabase();
    }

    // Get total stats
    const totalResult = await this.database!.executeSql(`
      SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as size 
      FROM media_assets
    `);

    // Get category breakdown
    const categoryResult = await this.database!.executeSql(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*) as count,
        COALESCE(SUM(file_size), 0) as size
      FROM media_assets 
      GROUP BY category 
      ORDER BY size DESC
    `);

    // Get recent activity
    const activityResult = await this.database!.executeSql(`
      SELECT ua.*, ma.filename 
      FROM usage_analytics ua
      JOIN media_assets ma ON ua.asset_id = ma.id
      ORDER BY ua.timestamp DESC
      LIMIT 10
    `);

    const categoryBreakdown: { category: string; count: number; size: number }[] = [];
    for (let i = 0; i < categoryResult[0].rows.length; i++) {
      categoryBreakdown.push(categoryResult[0].rows.item(i));
    }

    const recentActivity: UsageAnalytic[] = [];
    for (let i = 0; i < activityResult[0].rows.length; i++) {
      recentActivity.push(activityResult[0].rows.item(i));
    }

    return {
      totalAssets: totalResult[0].rows.item(0).count,
      totalSize: totalResult[0].rows.item(0).size,
      categoryBreakdown,
      recentActivity
    };
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}

export default new AssetDatabase();