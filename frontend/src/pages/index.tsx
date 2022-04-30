import axios from 'axios'
import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { Wrap, WrapItem, Button, Flex, Box, SimpleGrid } from '@chakra-ui/react'
import Login from 'components/Login'
import Logout from 'components/Logout'
import VideoGridItem from 'components/VideoGridItem'
import Video from 'types/Video'
import PrivacyStatus from 'enums/PrivacyStatus'
import VideoDetails from 'components/VideoDetails'

let gapi

const Home: NextPage = () => {
  const [accessToken, setAccessToken] = useState()
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

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
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&maxResults=50&playlistId=${uploadsPlaylistId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    const vids = videosRes.data.items.map((v) => ({
      id: v.snippet.resourceId.videoId,
      publishedAt: v.snippet.publishedAt,
      title: v.snippet.title,
      description: v.snippet.description,
      thumbnailUrl: `https://img.youtube.com/vi/${v.snippet.resourceId.videoId}/maxresdefault.jpg`,
      channelId: v.snippet.channelId,
      channelName: v.snippet.channelTitle,
      privacyStatus: v.status.privacyStatus,
    }))
    setVideos(vids)
  }

  return (
    <div>
      <div>
        <Login onSuccess={() => setAccessToken(gapi.auth.getToken()?.access_token)} />
        <Button onClick={getChannels}>Get my channels</Button>
        <Logout />
      </div>

      <Flex>
        <SimpleGrid columns={3} spacing={4} w="70%">
          {videos
            .filter((v) => v.privacyStatus === PrivacyStatus.Public)
            .map((v) => (
              <WrapItem key={v.id}>
                <VideoGridItem video={v} onClick={() => setSelectedVideo(v)} />
              </WrapItem>
            ))}
        </SimpleGrid>
        <Box w="30%" borderLeft="1px">
          <VideoDetails video={selectedVideo} />
        </Box>
      </Flex>
    </div>
  )
}

export default Home
