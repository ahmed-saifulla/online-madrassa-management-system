import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isAdmin = !!localStorage.getItem('madrassa_admin')
    const p = router.pathname
    // Only guard admin routes. Allow public pages (/, /teacher/login, /student/login, etc.)
    if (p.startsWith('/admin')) {
      if (!isAdmin && p !== '/admin/login') {
        router.replace('/admin/login')
      } else if (isAdmin && p === '/admin/login') {
        router.replace('/welcome')
      }
    }
  }, [router])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Online Madrassa</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
