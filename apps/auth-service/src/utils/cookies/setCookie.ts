import { Response } from 'express';

export const setCookie = (res: Response, name: string, value: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const options: any = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  // Hard-coded domain so cookies are shared across subdomains
  options.domain = '.zudox.online';

  res.cookie(name, value, options);
};
