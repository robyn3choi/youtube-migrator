import { Box, Button, Image, Text } from '@chakra-ui/react'
import Video from 'types/Video'

type Props = {
  video: Video
  onClick: () => void
}

export default function VideoGridItem({ video, onClick }: Props) {
  return (
    <Box onClick={onClick} p={2} maxWidth="340px" borderWidth="1px" borderRadius="sm">
      <Image src={video.thumbnailUrl} alt={video.title} />
      <Text fontSize="md">{video.title}</Text>
    </Box>
  )
}
