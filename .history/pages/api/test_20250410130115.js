export default function handler(req, res) {
  try {
    const apiKey = process.env.STABILITY_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Stability API key is missing' });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Stability API key is available',
      keyPreview: `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
} 