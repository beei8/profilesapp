// API utility for handling requests in both dev and production

const API_BASE = import.meta.env.PROD 
  ? 'https://profilesapp-production.up.railway.app'
  : 'http://localhost:3001'

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    return response
  } catch (error) {
    console.error(`API call failed: ${url}`, error)
    throw error
  }
}

export async function apiPost(endpoint, data) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiGet(endpoint, token) {
  return apiCall(endpoint, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}