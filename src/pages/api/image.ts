import { NextApiRequest, NextApiResponse } from 'next';
import { getScreenshot } from './_lib/chromium';
import { getHtml } from './_lib/template';
import { connectToDatabase } from '@/utils/mongodb';

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
  try {
    const { type, range, data, profile } = req.body;
    const { db } = await connectToDatabase();

    const { country, display_name, id, product, type: user_type } = profile as Spotify.PrivateUser;

    if (!type) {
      throw new Error('Missing template type.');
    }

    if (!range) {
      throw new Error('Missing template range.');
    }

    if (!data) {
      throw new Error('Missing template data.');
    }

    const html = getHtml({ type, range, data, profile });

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
      profile: { country, display_name, id, product, type: user_type },
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
