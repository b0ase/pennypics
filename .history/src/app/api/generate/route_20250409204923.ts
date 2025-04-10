import { NextResponse } from 'next/server';

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_HOST = 'https://api.stability.ai';

export async function POST(request: Request) {
  try {
    const { prompt, negativePrompt, guidanceScale, resolution } = await request.json();

    if (!STABILITY_API_KEY) {
      return NextResponse.json(
        { error: 'Stability API key not configured' },
        { status: 500 }
      );
    }

    const [width, height] = resolution.split('x').map(Number);

    const response = await fetch(
      `${STABILITY_API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
            ...(negativePrompt
              ? [
                  {
                    text: negativePrompt,
                    weight: -1,
                  },
                ]
              : []),
          ],
          cfg_scale: guidanceScale,
          height,
          width,
          steps: 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to generate image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 