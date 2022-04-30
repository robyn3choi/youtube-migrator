import { Box, Button, Image, Text } from '@chakra-ui/react'
import axios from 'axios'
import { Web3Storage } from 'web3.storage'
import Video from 'types/Video'

type Props = {
  video: Video
}
export default function VideoDetails({ video }: Props) {
  async function thing() {
    try {
      console.log('req')
      const res = await axios.post(
        '/api/ytdl',
        { url: `https://www.youtube.com/watch?v=${video.id}` },
        { responseType: 'blob' }
      )
      console.log(res)

      const file = new File([res.data], `${video.id}.mp4`)
      const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN! })
      const cid = await client.put([file])
      console.log('stored files with cid:', cid)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Box>
      <Text>{video?.title}</Text>
      <Button onClick={thing}>do the thing</Button>
    </Box>
  )
}
