import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'users.db')
const db = new Database(dbPath)

// Create admin user setup script
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter admin username: ', (username) => {
  rl.question('Enter admin password: ', (password) => {
    rl.question('Confirm admin password: ', (confirmPassword) => {
      if (password !== confirmPassword) {
        console.error('Passwords do not match!')
        process.exit(1)
      }

      if (password.length < 8) {
        console.error('Password must be at least 8 characters long!')
        process.exit(1)
      }

      try {
        const passwordHash = bcrypt.hashSync(password, 12)

        const createUser = db.prepare(`
          INSERT INTO users (username, password_hash)
          VALUES (?, ?)
        `)

        createUser.run(username, passwordHash)
        console.log(`✅ Admin user '${username}' created successfully!`)

      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.error('❌ Username already exists!')
        } else {
          console.error('❌ Error creating admin user:', error.message)
        }
        process.exit(1)
      }

      rl.close()
      db.close()
    })
  })
})