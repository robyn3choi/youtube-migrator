import PrivacyStatus from 'enums/PrivacyStatus'

export default interface Video {
  id: string
  publishedAt: string
  title: string
  description: string
  thumbnailUrl: string
  channelId: string
  channelName: string
  privacyStatus: PrivacyStatus
}
