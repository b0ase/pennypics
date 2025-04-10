export default function handler(req, res) {
  // Get all environment variables
  const envVars = {};
  
  // Add the ones we care about
  envVars.NODE_ENV = process.env.NODE_ENV;
  envVars.STABILITY_API_KEY_EXISTS = process.env.STABILITY_API_KEY ? 'yes' : 'no';
  
  // If it exists, show a preview
  if (process.env.STABILITY_API_KEY) {
    const key = process.env.STABILITY_API_KEY;
    envVars.STABILITY_API_KEY_PREVIEW = `${key.substring(0, 3)}...${key.substring(key.length - 3)}`;
  }
  
  res.status(200).json(envVars);
} 