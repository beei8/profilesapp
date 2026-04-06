import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import db from './db.js'

dotenv.config()

const app = express()
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET

app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again later.'
})

// Apply rate limiting to all requests
app.use('/api/', limiter)

// Apply stricter rate limiting to login endpoint
app.use('/api/login', loginLimiter)

// Prepare database statements
const getUserByUsername = db.prepare('SELECT * FROM users WHERE username = ?')
const updateLastLogin = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body

  // Basic input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({ message: 'Username must be at least 3 characters and password at least 6 characters' })
  }

  try {
    // Check if user already exists
    const existingUser = getUserByUsername.get(username)
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Insert new user
    const insertUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    const result = insertUser.run(username, passwordHash)

    res.status(201).json({ message: 'User registered successfully', userId: result.lastInsertRowid })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Setup endpoint for first admin user (only works when no users exist)
app.post('/api/setup', async (req, res) => {
  const { username, password, setupKey } = req.body

  // Check if setup key matches environment variable
  if (setupKey !== process.env.SETUP_KEY) {
    return res.status(403).json({ message: 'Invalid setup key' })
  }

  // Check if any users already exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  if (userCount.count > 0) {
    return res.status(403).json({ message: 'Setup already completed' })
  }

  // Basic input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  if (username.length < 3 || password.length < 8) {
    return res.status(400).json({ message: 'Username must be at least 3 characters and password at least 8 characters' })
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Insert admin user
    const insertUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    const result = insertUser.run(username, passwordHash)

    console.log(`🚀 Admin user '${username}' created via setup endpoint`)

    res.status(201).json({
      message: 'Admin user created successfully',
      userId: result.lastInsertRowid,
      note: 'Setup endpoint is now disabled'
    })
  } catch (error) {
    console.error('Setup error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  // Basic input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  try {
    const user = getUserByUsername.get(username)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Update last login
    updateLastLogin.run(user.id)

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' })
    res.json({ token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is protected data!` })
})

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = getUserByUsername.get(req.user.username)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Return user info without password hash
    res.json({
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      last_login: user.last_login
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})