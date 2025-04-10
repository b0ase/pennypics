export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.STABILITY_API_KEY;
    
    // More detailed API key validation
    if (!apiKey) {
      console.error('Stability API key is missing in environment variables');
      return res.status(500).json({ 
        error: 'Stability API key is missing', 
        details: 'Please check server configuration. The API key environment variable is not set.'
      });
    }
    
    // Log a masked version of the key for debugging
    console.log(`Using Stability API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
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
    
    try {
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
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error('Stability API error:', errorData);
        
        // Enhanced error handling for authentication issues
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication error with Stability API: ${errorData.message || 'Invalid API key'}. Please check your API key configuration.`);
        }
        
        throw new Error(`Stability API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.artifacts || data.artifacts.length === 0) {
        throw new Error('No images were generated');
      }
      
      // If multiple samples were requested, return all of them
      const images = data.artifacts.map(artifact => artifact.base64);
      
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
    } catch (apiError) {
      console.error('Stability API request error:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating image:', error);
    
    // More user-friendly error messages
    let userMessage = 'Failed to generate image';
    let detailedMessage = error.message;
    
    if (error.message.includes('API key')) {
      userMessage = 'API Configuration Error';
      detailedMessage = 'There appears to be an issue with our image generation service configuration. Our team has been notified and is working to resolve this issue. Please try again later.';
    }
    
    return res.status(500).json({ 
      error: userMessage,
      details: detailedMessage
    });
  }
} 