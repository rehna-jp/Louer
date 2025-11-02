import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'dwello',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      charset: 'utf8mb4',
    });
  }
  return pool;
}

export async function bootstrapSchema() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // Use a widely compatible collation for MySQL/MariaDB
    await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

    const ddl = `
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  name VARCHAR(100) NULL,
  role ENUM('tenant','landlord','admin') NOT NULL DEFAULT 'tenant',
  phone VARCHAR(30) NULL,
  email_verified_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY ux_users_email (email),
  KEY ix_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  landlord_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  location_city VARCHAR(100) NULL,
  location_area VARCHAR(100) NULL,
  latitude DECIMAL(9,6) NULL,
  longitude DECIMAL(9,6) NULL,
  price_monthly_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  type ENUM('room','apartment','hostel','studio') NOT NULL,
  status ENUM('active','occupied','inactive','draft') NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_listings_landlord (landlord_id),
  KEY ix_listings_status (status),
  KEY ix_listings_type (type),
  CONSTRAINT fk_listings_landlord FOREIGN KEY (landlord_id)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listing_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(2048) NOT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY ux_listing_images_order (listing_id, position),
  KEY ix_listing_images_listing (listing_id),
  CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id)
    REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  move_in_date DATE NOT NULL,
  months SMALLINT UNSIGNED NULL,
  status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  price_monthly_cents INT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_bookings_listing (listing_id),
  KEY ix_bookings_tenant (tenant_id),
  KEY ix_bookings_status (status),
  CONSTRAINT fk_bookings_listing FOREIGN KEY (listing_id)
    REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_tenant FOREIGN KEY (tenant_id)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  listing_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY ux_favorites_user_listing (user_id, listing_id),
  KEY ix_favorites_user (user_id),
  KEY ix_favorites_listing (listing_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_listing FOREIGN KEY (listing_id)
    REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_threads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT UNSIGNED NOT NULL,
  landlord_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY ux_thread_unique (listing_id, tenant_id),
  KEY ix_threads_landlord (landlord_id),
  KEY ix_threads_tenant (tenant_id),
  CONSTRAINT fk_threads_listing FOREIGN KEY (listing_id)
    REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_threads_landlord FOREIGN KEY (landlord_id)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_threads_tenant FOREIGN KEY (tenant_id)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  thread_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_messages_thread (thread_id),
  KEY ix_messages_sender (sender_id),
  CONSTRAINT fk_messages_thread FOREIGN KEY (thread_id)
    REFERENCES message_threads(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
`;

    // Execute each DDL statement
    const statements = ddl
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await conn.query(stmt);
    }

    // Ensure FULLTEXT index exists for listings(title, description) without failing on restart
    const [rows] = await conn.query(
      `SELECT COUNT(1) AS cnt FROM information_schema.STATISTICS
       WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
      ['listings', 'ftx_listings_title_desc']
    );
    if (rows[0]?.cnt === 0) {
      await conn.query('ALTER TABLE listings ADD FULLTEXT KEY ftx_listings_title_desc (title, description)');
    }

    console.log('MySQL schema ensured.');
  } finally {
    conn.release();
  }
}
