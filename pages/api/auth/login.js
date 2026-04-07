export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  try {
    const apiBase = 'https://77c2-2406-7400-56-1851-00-102.ngrok-free.app'
    const apiVersion = process.env.API_VERSION || '/api/v1'
    const url = `${apiBase}${apiVersion}/auth/login`

    console.log(`Sending login request to ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}