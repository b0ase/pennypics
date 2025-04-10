import { Connection } from '@solana/web3.js';

// List of reliable public RPC endpoints
export const RPC_ENDPOINTS = [
  { id: 'helius', name: 'Helius', url: 'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5' },
  { id: 'quicknode', name: 'QuickNode', url: 'https://green-late-wildflower.solana-mainnet.quiknode.pro/c00a7ef0fb99cee10eb9fcd38a0a0e717b341ae1/' },
  { id: 'serum', name: 'Project Serum', url: 'https://solana-api.projectserum.com' },
  { id: 'mainnet', name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
  { id: 'genesysgo', name: 'GenesysGo', url: 'https://ssc-dao.genesysgo.net/' },
  { id: 'alchemy', name: 'Alchemy', url: 'https://solana-mainnet.g.alchemy.com/v2/demo' },
];

/**
 * Test if an RPC endpoint is healthy
 */
export async function testRpcEndpoint(url) {
  try {
    console.log(`Testing RPC endpoint health: ${url}`);
    const testConnection = new Connection(url);
    await testConnection.getLatestBlockhash();
    return true;
  } catch (error) {
    console.error(`RPC health check failed for ${url}:`, error);
    return false;
  }
}

/**
 * Get the currently selected RPC URL
 */
export function getCurrentRpcUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  }
  
  return localStorage.getItem('solana-rpc-url') || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
}

/**
 * Create a Solana connection with automatic fallback
 */
export async function createSolanaConnection(commitment = 'confirmed') {
  const primaryUrl = getCurrentRpcUrl();
  
  // Try the primary URL first
  if (primaryUrl) {
    try {
      const connection = new Connection(primaryUrl, commitment);
      // Test if it's working
      await connection.getLatestBlockhash();
      console.log(`Using RPC endpoint: ${primaryUrl}`);
      return connection;
    } catch (error) {
      console.error(`Primary RPC endpoint failed: ${primaryUrl}`, error);
      // Fall through to try alternatives
    }
  }
  
  // If primary fails, try each endpoint in order until we find one that works
  for (const endpoint of RPC_ENDPOINTS) {
    if (endpoint.url === primaryUrl) continue; // Skip the one we already tried
    
    try {
      console.log(`Trying fallback RPC endpoint: ${endpoint.url}`);
      const connection = new Connection(endpoint.url, commitment);
      await connection.getLatestBlockhash();
      
      // If it works, update the stored endpoint
      if (typeof window !== 'undefined') {
        localStorage.setItem('solana-rpc-url', endpoint.url);
      }
      
      console.log(`Using fallback RPC endpoint: ${endpoint.url}`);
      return connection;
    } catch (fallbackError) {
      console.error(`Fallback RPC endpoint failed: ${endpoint.url}`, fallbackError);
    }
  }
  
  // If all fallbacks fail, throw an error
  throw new Error('Could not connect to any Solana RPC endpoint');
} 