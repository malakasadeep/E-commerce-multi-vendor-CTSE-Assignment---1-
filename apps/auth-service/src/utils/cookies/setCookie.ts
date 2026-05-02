import { Response } from 'express';

export const setCookie = (
  req: any,
  res: Response,
  name: string,
  value: string
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  // Detect HTTPS via direct connection or reverse-proxy forwarding header.
  // The gateway sets X-Forwarded-Proto when it proxies requests, so this
  // works correctly whether the auth service is behind a proxy or not.
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https';
  const useSecureCookie = isProduction && isHttps;

  const options: any = {
    httpOnly: true,
    secure: useSecureCookie,
    // sameSite:'none' requires secure:true; fall back to 'lax' for HTTP.
    sameSite: useSecureCookie ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  if (isProduction) {
    options.domain = '.zudox.online';
  } else if (req.headers.origin) {
    const url = new URL(req.headers.origin);
    if (url.hostname !== 'localhost' && !url.hostname.startsWith('127.')) {
      options.domain = url.hostname.split('.').slice(-2).join('.');
    }
  }

  res.cookie(name, value, options);
};
