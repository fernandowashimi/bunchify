import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from '@/utils/mongodb';

import { getScreenshot } from './_lib/chromium';
import { getArtistsHtml } from './_templates/artists';
import { getTracksHtml } from './_templates/tracks';

interface Map {
  [key: string]: (params: Application.GetTemplateInput) => string;
}

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

const TemplateType: Map = {
  artists: getArtistsHtml,
  tracks: getTracksHtml,
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
  try {
    const { type, range, data, profile } = req.body;
    const { db } = await connectToDatabase();

    const { display_name } = profile as Spotify.PrivateUser;

    if (!type) {
      throw new Error('Missing template type.');
    }

    if (!range) {
      throw new Error('Missing template range.');
    }

    if (!data) {
      throw new Error('Missing template data.');
    }

    const html = TemplateType[type]({ type, range, data, profile });

    if (isHtmlDebug) {
      res.setHeader('Content-Type', 'text/html');
      res.end(html);

      return;
    }

    const file = await getScreenshot(html, isDev);

    res.statusCode = 200;

    res.setHeader('Content-Type', `image/png`);
    res.setHeader(
      'Cache-Control',
      'public, immutable, no-transform, s-maxage=31536000, max-age=31536000',
    );

    await db.collection('logs').insertOne({
      display_name,
      type,
      range,
      createdAt: new Date().toString(),
    });

    res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
    console.error(e);
  }
};
