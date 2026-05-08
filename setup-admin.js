#!/usr/bin/env node

// Production setup script for initial admin user creation
// Usage: node setup-admin.js <username> <password> <setup-key>

import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
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

(async () => {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'profilesapp'
  })

  try {
    // Check if any users already exist
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users')
    if (parseInt(userCount.rows[0].count) > 0) {
      console.error('❌ Setup already completed - users already exist!')
      process.exit(1)
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 12)

    // Insert admin user
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username, passwordHash]
    )

    console.log(`✅ Admin user '${username}' created successfully!`)
    console.log('🚀 You can now log in with these credentials.')

  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      console.error('❌ Username already exists!')
    } else {
      console.error('❌ Error creating admin user:', error.message)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
})()