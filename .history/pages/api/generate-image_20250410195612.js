export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.STABILITY_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Stability API key is missing' });
    }
    
    const { prompt, style = 'photographic', width = 1024, height = 1024, samples = 1 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Validate parameters
    const validStyles = ['photographic', 'digital-art', 'enhance', 'anime', 'cinematic', 'neon-punk', 'isometric', 'low-poly', 'origami', 'line-art', 'pixel-art'];
    const styleToUse = validStyles.includes(style) ? style : 'photographic';
    
    const validatedWidth = Math.min(Math.max(512, parseInt(width) || 1024), 1536);
    const validatedHeight = Math.min(Math.max(512, parseInt(height) || 1024), 1536);
    const validatedSamples = Math.min(Math.max(1, parseInt(samples) || 1), 4);

    // Add negative prompt for better results
    const negativePrompt = "blurry, distorted, deformed, ugly, poor quality, low resolution";
    
    // Call Stability AI API
    console.log(`Generating image with prompt: "${prompt}", style: ${styleToUse}, dimensions: ${validatedWidth}x${validatedHeight}`);
    
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: negativePrompt,
            weight: -1
          }
        ],
        style_preset: styleToUse,
        cfg_scale: 7,
        height: validatedHeight,
        width: validatedWidth,
        samples: validatedSamples,
        steps: 40
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Stability API error:', error);
      throw new Error(`Stability API error: ${error.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Stability API response status:', response.status);
    console.log('Stability API artifacts count:', data.artifacts ? data.artifacts.length : 0);
    
    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error('No images were generated');
    }
    
    // If multiple samples were requested, return all of them
    const images = data.artifacts.map(artifact => artifact.base64);
    
    // Ensure we have valid image data
    if (!images || images.length === 0 || !images[0]) {
      console.error('No valid image data returned from Stability AI');
      return res.status(500).json({ 
        error: 'Failed to generate image',
        details: 'No valid image data received from AI service'
      });
    }
    
    console.log(`Successfully generated ${images.length} images. First image length: ${images[0].length} chars`);
    
    return res.status(200).json({
      success: true,
      images: images,
      metadata: {
        style: styleToUse,
        width: validatedWidth,
        height: validatedHeight,
        samples: validatedSamples
      }
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
} 