import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'profilesapp'
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `)
    console.log('✅ Database tables initialized')

    // Create initial admin user in development only
    if (process.env.NODE_ENV !== 'production') {
      const existingAdmin = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        ['admin']
      )
      if (existingAdmin.rows.length === 0) {
        const adminPassword = bcrypt.hashSync('password123', 12)
        await pool.query(
          'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
          ['admin', adminPassword]
        )
        console.log('Development admin user created')
      }
    } else {
      console.log('Production mode: No default admin user created')
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    process.exit(1)
  }
}

// Initialize database on startup
try {
  await initializeDatabase()
} catch (error) {
  console.error('Failed to initialize database:', error)
  process.exit(1)
}

export { pool }