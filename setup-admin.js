#!/usr/bin/env node

// Production setup script for initial admin user creation
// Usage: node setup-admin.js <username> <password> <setup-key>

import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const [,, username, password, setupKey] = process.argv

if (!username || !password || !setupKey) {
  console.error('Usage: node setup-admin.js <username> <password> <setup-key>')
  console.error('Example: node setup-admin.js admin MySecurePass123! abc123def456')
  process.exit(1)
}

// Validate setup key
if (setupKey !== process.env.SETUP_KEY) {
  console.error('❌ Invalid setup key!')
  process.exit(1)
}

// Validate password strength
if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters long!')
  process.exit(1)
}

try {
  const dbPath = path.join(__dirname, 'users.db')
  const db = new Database(dbPath)

  // Check if any users already exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  if (userCount.count > 0) {
    console.error('❌ Setup already completed - users already exist!')
    db.close()
    process.exit(1)
  }

  // Hash password
  const passwordHash = bcrypt.hashSync(password, 12)

  // Insert admin user
  const insertUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
  insertUser.run(username, passwordHash)

  db.close()

  console.log(`✅ Admin user '${username}' created successfully!`)
  console.log('🚀 You can now log in with these credentials.')

} catch (error) {
  console.error('❌ Error creating admin user:', error.message)
  process.exit(1)
}