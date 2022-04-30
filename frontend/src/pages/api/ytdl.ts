// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytdl from 'ytdl-core'
import fs from 'fs'

type Data = {
  name: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === 'POST') {
    try {
      const url = req.body.url
      res.setHeader('content-type', 'video/mp4')
      await ytdl(url).pipe(res)
    } catch (err) {
      console.log('err: ', err)
    }
  } else {
    res.status(400).json({ result: false })
  }
}
