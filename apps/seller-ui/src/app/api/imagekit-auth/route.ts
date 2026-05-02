import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const publicKey =
  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
  'public_R1K+TVT2W3Wh4+VgiVVxYzbHUyk=';
const privateKey =
  process.env.IMAGEKIT_PRIVATE_KEY || 'private_bytVtBqyot5OBrt+m31DcBGk/So=';
const urlEndpoint =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
  'https://ik.imagekit.io/your_imagekit_id';

let imagekit: ImageKit | null = null;

if (publicKey && privateKey && urlEndpoint) {
  imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

export async function GET() {
  if (!imagekit) {
    return NextResponse.json(
      {
        error:
          'ImageKit is not configured. Please set IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.',
      },
      { status: 500 }
    );
  }
  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json(authParams);
}
