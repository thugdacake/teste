
import { pool } from './db-init';

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na query MySQL:', error);
    throw error;
  }
}

export async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      discord_id VARCHAR(255) UNIQUE,
      discord_username VARCHAR(255),
      avatar VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user' NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      cover_image VARCHAR(255) NOT NULL,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      author_id INT,
      category_id INT,
      published BOOLEAN DEFAULT true,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES news_categories(id)
    )`,
    `CREATE TABLE IF NOT EXISTS news_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      color VARCHAR(50) DEFAULT '#00E5FF' NOT NULL
    )`
  ];

  for (const table of tables) {
    await query(table);
  }
}
