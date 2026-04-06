import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'users.db')
const db = new Database(dbPath)

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )
`)

// Create initial admin user if it doesn't exist
// NOTE: In production, create admin user through proper registration or admin panel
const createUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password_hash)
  VALUES (?, ?)
`)

// Only create admin user in development
if (process.env.NODE_ENV !== 'production') {
  const adminPassword = bcrypt.hashSync('password123', 12)
  createUser.run('admin', adminPassword)
  console.log('Development admin user created')
} else {
  console.log('Production mode: No default admin user created')
}

console.log('Database initialized with admin user')

export default db