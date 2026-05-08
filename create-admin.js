import pg from 'pg'
import bcrypt from 'bcryptjs'
import readline from 'readline'
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

// Create admin user setup script
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter admin username: ', (username) => {
  rl.question('Enter admin password: ', (password) => {
    rl.question('Confirm admin password: ', async (confirmPassword) => {
      if (password !== confirmPassword) {
        console.error('❌ Passwords do not match!')
        process.exit(1)
      }

      if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters long!')
        process.exit(1)
      }

      try {
        const passwordHash = bcrypt.hashSync(password, 12)

        await pool.query(
          'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
          [username, passwordHash]
        )
        console.log(`✅ Admin user '${username}' created successfully!`)

      } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique constraint violation
          console.error('❌ Username already exists!')
        } else {
          console.error('❌ Error creating admin user:', error.message)
        }
        process.exit(1)
      } finally {
        rl.close()
        await pool.end()
      }
    })
  })
})