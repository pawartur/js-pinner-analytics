import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import TimeSeries from "../components/TimeSeries"
import { ApolloProvider } from '@apollo/client';
import { client } from "../utils/graphql";

const Home: NextPage = () => {
  return (
    <ApolloProvider client={client}>
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
    </ApolloProvider>
  )
}

export default Home
