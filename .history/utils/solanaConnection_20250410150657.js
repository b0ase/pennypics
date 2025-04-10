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
  // Try all endpoints in parallel to use the fastest working one
  const primaryUrl = getCurrentRpcUrl();
  const allEndpoints = [
    primaryUrl,
    ...RPC_ENDPOINTS.filter(e => e.url !== primaryUrl).map(e => e.url)
  ].filter(Boolean); // Filter out any undefined values
  
  console.log("Trying all RPC endpoints in parallel:", allEndpoints);
  
  // Create a promise for each endpoint
  const connectionPromises = allEndpoints.map(async (endpoint) => {
    try {
      const connection = new Connection(endpoint, commitment);
      // Start a timer to measure response time
      const startTime = Date.now();
      await connection.getLatestBlockhash();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`Endpoint ${endpoint} responded in ${responseTime}ms`);
      
      return {
        connection,
        endpoint,
        responseTime,
        success: true
      };
    } catch (error) {
      console.error(`Endpoint ${endpoint} failed:`, error);
      return {
        endpoint,
        success: false,
        error
      };
    }
  });
  
  // Use Promise.all to try all endpoints in parallel
  // Then sort results by success and response time
  const results = await Promise.all(connectionPromises);
  const successfulConnections = results
    .filter(result => result.success)
    .sort((a, b) => a.responseTime - b.responseTime);
  
  if (successfulConnections.length > 0) {
    // Use the fastest successful connection
    const fastest = successfulConnections[0];
    console.log(`Using fastest RPC endpoint: ${fastest.endpoint} (${fastest.responseTime}ms)`);
    
    // Store this endpoint for future use
    if (typeof window !== 'undefined') {
      localStorage.setItem('solana-rpc-url', fastest.endpoint);
    }
    
    return fastest.connection;
  }
  
  // If all endpoints failed, create a connection with the primary URL
  // This will likely fail too, but at least we're providing a connection object
  console.error("All RPC endpoints failed! Using default connection.");
  return new Connection(primaryUrl || RPC_ENDPOINTS[0].url, commitment);
} 