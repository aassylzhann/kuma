import '../styles/globals.css'
import { useState, useEffect } from 'react'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Токенді тексеру
    const token = localStorage.getItem('token')
    if (token) {
      // User ақпаратын алу (опциялық)
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  return <Component {...pageProps} user={user} setUser={setUser} />
}
