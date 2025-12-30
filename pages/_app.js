import '../styles/globals.css'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = router.pathname
    const guards = [
      { prefix: '/admin', key: 'madrassa_admin', login: '/admin/login' },
      { prefix: '/teachers', key: 'madrassa_admin', login: '/admin/login' },
      { prefix: '/divisions', key: 'madrassa_admin', login: '/admin/login' },
      { prefix: '/teacher', key: 'madrassa_teacher', login: '/teacher/login' },
      { prefix: '/student', key: 'madrassa_student', login: '/student/login' }
    ]

    // find first matching guard for the current path
    const guard = guards.find(g => p === g.prefix || p.startsWith(g.prefix + '/')) || (guards.find(g => p.startsWith(g.prefix)) && guards.find(g => p.startsWith(g.prefix)))
    if (guard) {
      const hasAuth = !!localStorage.getItem(guard.key)
      if (!hasAuth && p !== guard.login) {
        router.replace(guard.login)
        return
      }
      // prevent logged in users from visiting login pages for their role
      if (hasAuth && p === guard.login) {
        router.replace('/welcome')
        return
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
