// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytmux from 'ytdl-core-muxer'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === 'POST') {
    try {
      const url = req.body.url
      res.setHeader('content-type', 'video/mp4')
      await ytmux(url).pipe(res)
    } catch (err) {
      console.log('err: ', err)
    }
  } else {
    res.status(400).json({ result: false })
  }
}
