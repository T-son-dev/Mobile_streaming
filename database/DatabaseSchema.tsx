export interface DatabaseSchema {
  media_assets: {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    format: string;
    width: number | null;
    height: number | null;
    created_at: string;
    last_used: string | null;
    usage_count: number;
    category: string | null;
    tags: string | null;
    is_favorite: boolean;
  };
  
  categories: {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
    created_at: string;
  };
  
  usage_analytics: {
    id: number;
    asset_id: number;
    action: 'view' | 'use' | 'edit';
    timestamp: string;
  };
}

export const SQL_SCHEMAS = {
  media_assets: `
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
  `,
  
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      color TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  usage_analytics: `
    CREATE TABLE IF NOT EXISTS usage_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER,
      action TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES media_assets(id)
    );
  `,
  
  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_filename ON media_assets(filename);',
    'CREATE INDEX IF NOT EXISTS idx_category ON media_assets(category);',
    'CREATE INDEX IF NOT EXISTS idx_created_at ON media_assets(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_last_used ON media_assets(last_used);',
    'CREATE INDEX IF NOT EXISTS idx_usage_asset ON usage_analytics(asset_id);',
    'CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_analytics(timestamp);'
  ]
};

export const DEFAULT_CATEGORIES = [
  { name: 'Logos', color: '#4F46E5', icon: 'logo' },
  { name: 'Overlays', color: '#059669', icon: 'layers' },
  { name: 'Backgrounds', color: '#DC2626', icon: 'image' },
  { name: 'Screenshots', color: '#7C2D12', icon: 'camera' },
  { name: 'Custom', color: '#6B7280', icon: 'folder' }
];