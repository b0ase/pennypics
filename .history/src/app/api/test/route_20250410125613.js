export async function GET() {
  try {
    const apiKey = process.env.STABILITY_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Stability API key is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Stability API key is available',
      keyPreview: `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 