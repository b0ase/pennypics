import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// List of reliable public RPC endpoints for mainnet
export const RPC_ENDPOINTS = [
  { id: 'mainnet', name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
  { id: 'helius', name: 'Helius', url: 'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5' },
  { id: 'serum', name: 'Project Serum', url: 'https://solana-api.projectserum.com' }
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
  // Always use mainnet endpoints
  const allEndpoints = RPC_ENDPOINTS.map(e => e.url);
  
  console.log("Attempting to connect to Solana mainnet...");
  
  // Try each endpoint until one works
  for (const endpoint of allEndpoints) {
    try {
      const connection = new Connection(endpoint, {
        commitment,
        confirmTransactionInitialTimeout: 30000
      });
      
      // Test the connection
      const blockHeight = await connection.getBlockHeight();
      console.log(`Successfully connected to mainnet via ${endpoint}`);
      console.log(`Current block height: ${blockHeight}`);
      
      return connection;
    } catch (error) {
      console.error(`Failed to connect to ${endpoint}:`, error);
      continue;
    }
  }
  
  // If all endpoints failed, use the official mainnet as last resort
  console.log("Falling back to official mainnet endpoint");
  return new Connection('https://api.mainnet-beta.solana.com', {
    commitment,
    confirmTransactionInitialTimeout: 30000
  });
} 