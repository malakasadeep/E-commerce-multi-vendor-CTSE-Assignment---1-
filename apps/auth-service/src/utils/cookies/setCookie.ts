import { Response } from 'express';

export const setCookie = (
  req: any,
  res: Response,
  name: string,
  value: string
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const options: any = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  // Extract domain from request origin header
  // In production, use .zudox.online for subdomain sharing
  // In development, use the actual domain from the request
  if (isProduction) {
    options.domain = '.zudox.online';
  } else if (req.headers.origin) {
    // Extract domain from origin (e.g., http://zudox.online or http://localhost:3000)
    const url = new URL(req.headers.origin);
    if (url.hostname !== 'localhost' && !url.hostname.startsWith('127.')) {
      // For actual domains (not localhost), set domain so subdomains can access it
      options.domain = url.hostname.split('.').slice(-2).join('.'); // e.g., zudox.online
    }
    // For localhost/127.x.x.x, don't set domain (host-only cookie)
  }

  res.cookie(name, value, options);
};
