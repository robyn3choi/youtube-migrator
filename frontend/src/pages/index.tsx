import axios from 'axios'
import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Login from 'components/Login'
import Logout from 'components/Logout'
import styles from '../styles/Home.module.css'

let gapi

const Home: NextPage = () => {
  const [accessToken, setAccessToken] = useState()

  useEffect(() => {
    async function initGapi() {
      // need dynamic import to avoid "Cannot use import statement outside a module" error
      gapi = await import('gapi-script').then((pack) => pack.gapi)
      gapi.load('client:auth2', async () => {
        await gapi.client.init({
          clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/youtube.readonly',
        })
        setAccessToken(gapi.auth.getToken()?.access_token)
      })
    }
    initGapi()
  }, [])

  async function getChannels() {
    const channelRes = await axios('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads
    const videosRes = await axios(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,id,snippet&maxResults=50&playlistId=${uploadsPlaylistId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    console.log(videosRes.data)
  }

  return (
    <div className={styles.container}>
      <Login onSuccess={() => setAccessToken(gapi.auth.getToken()?.access_token)} />
      <button onClick={getChannels}>Get my channels</button>
      <Logout />
    </div>
  )
}

export default Home
