import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import TimeSeries from "../components/TimeSeries";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Pinner Analytics</title>
      </Head>

      <main className={styles.main}>
        <TimeSeries></TimeSeries>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}

export default Home
