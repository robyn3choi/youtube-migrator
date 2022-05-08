import { Box, Button, Image, Text } from '@chakra-ui/react'
import axios from 'axios'
import { ethers } from 'ethers'
import escape from 'validator/lib/escape'
import { Web3Storage } from 'web3.storage'
import Video from 'types/Video'
import { useEffect, useRef, useState } from 'react'
import { useWeb3 } from 'context/Web3Context'

enum Status {
  NotStarted = 'Migrate',
  DownloadingThumbnail = 'Downloading thumbnail...',
  DownloadingVideo = 'Downloading video...',
  UploadingToIpfs = 'Uploading video and thumbnail to IPFS...',
  MintingNft = 'Minting NFT...',
  Finished = 'Migrated!',
}

type Props = {
  video: Video | null
}

export default function VideoDetails({ video }: Props) {
  const { nftContract } = useWeb3()
  const [status, setStatus] = useState<Status>(Status.NotStarted)
  const [tokenUri, setTokenUri] = useState<string>('')

  const web3Storage = useRef<Web3Storage>()

  useEffect(() => {
    web3Storage.current = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN! })
  }, [])

  useEffect(() => {
    async function checkIfVideoAlreadyMinted() {
      console.log('check if minted')
      const tokenId = await nftContract!.videoIdToTokenId(video!.id)

      if (!tokenId?.isZero()) {
        console.log('is minted')
        const _tokenUri = await nftContract!.tokenURI(tokenId)
        setTokenUri(_tokenUri)
      } else {
        console.log('not minted')
      }
    }
    if (video && nftContract) {
      console.log(JSON.stringify(video!.description))
      checkIfVideoAlreadyMinted()
    }
  }, [video, nftContract])

  useEffect(() => {
    function update(tokenId, videoId) {
      console.log(tokenId, videoId)
    }
    if (nftContract) {
      nftContract.on('MintedNft', update)
    }
    return () => {
      if (nftContract) {
        nftContract.off('MintedNft', update)
      }
    }
  }, [nftContract])

  async function migrate() {
    try {
      setStatus(Status.DownloadingVideo)
      const videoFile = await handleVideo()

      setStatus(Status.DownloadingThumbnail)
      const thumbnailFile = await handleThumbnail()

      setStatus(Status.UploadingToIpfs)
      const cid = await web3Storage.current!.put([thumbnailFile, videoFile])

      setStatus(Status.MintingNft)

      await nftContract!.mintNft({
        publishedAt: video!.publishedAt,
        views: '0',
        likes: '0',
        dislikes: '0',
        commentCount: '0',
        id: video!.id,
        title: JSON.stringify(video!.title).slice(1, -1),
        channelId: video!.channelId,
        channelName: JSON.stringify(video!.channelName).slice(1, -1),
        thumbnailUri: `ipfs://${cid}/${video!.id}.jpg`,
        videoUri: `ipfs://${cid}/${video!.id}.mp4`,
        description: JSON.stringify(video!.description).slice(1, -1),
      })

      setStatus(Status.Finished)

      const tokenId = await nftContract!.videoIdToTokenId(video!.id)
      const _tokenUri = await nftContract!.tokenURI(tokenId)
      setTokenUri(_tokenUri)
    } catch (err) {
      console.log(err)
    }
  }

  async function handleThumbnail() {
    setStatus(Status.DownloadingThumbnail)
    const res = await axios.get(video!.thumbnailUrl, { responseType: 'blob' })
    return new File([res.data], `${video!.id}.jpg`)
  }

  async function handleVideo() {
    setStatus(Status.DownloadingVideo)
    const res = await axios.post(
      '/api/ytdl',
      { url: `https://www.youtube.com/watch?v=${video!.id}` },
      { responseType: 'blob' }
    )
    return new File([res.data], `${video!.id}.mp4`)
  }

  return (
    <Box>
      {video ? (
        <Box>
          {tokenUri && <Info heading="Token URI" value={tokenUri} truncate={false} />}
          <Info heading="ID" value={video.id} />
          <Info heading="Title" value={video.title} />
          <Info heading="Description" value={video.description} />
          <Info heading="Published at" value={video.publishedAt} />
          <Button
            isFullWidth
            onClick={migrate}
            isLoading={status !== Status.NotStarted && status !== Status.Finished}
            loadingText={status}
          >
            {status}
          </Button>
        </Box>
      ) : (
        'No video selected'
      )}
    </Box>
  )
}

function Info({ heading, value, truncate = true }) {
  return (
    <Box mb="4">
      <Text fontWeight="bold">{heading}</Text>
      <Text noOfLines={truncate ? 3 : undefined}>{value}</Text>
    </Box>
  )
}
