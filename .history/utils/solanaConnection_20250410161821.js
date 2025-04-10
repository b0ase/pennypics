import { Connection, PublicKey } from '@solana/web3.js';

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
  // Always use mainnet endpoints
  const primaryUrl = getCurrentRpcUrl();
  const allEndpoints = [
    'https://api.mainnet-beta.solana.com', // Try official mainnet first
    ...RPC_ENDPOINTS.filter(e => e.url !== primaryUrl).map(e => e.url)
  ].filter(Boolean);
  
  console.log("Attempting to connect to Solana mainnet using endpoints:", allEndpoints);
  
  // Create a promise for each endpoint
  const connectionPromises = allEndpoints.map(async (endpoint) => {
    try {
      const connection = new Connection(endpoint, {
        commitment,
        confirmTransactionInitialTimeout: 60000 // 60 second timeout
      });
      
      // Verify we can get the balance and it's a valid number
      const startTime = Date.now();
      const testPubKey = '4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB'; // Use recipient address as test
      const testBalance = await connection.getBalance(new PublicKey(testPubKey));
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Validate the response
      if (typeof testBalance !== 'number' || isNaN(testBalance)) {
        throw new Error('Invalid balance response');
      }
      
      console.log(`Endpoint ${endpoint} responded in ${responseTime}ms with valid balance`);
      
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
  const results = await Promise.all(connectionPromises);
  const successfulConnections = results
    .filter(result => result.success)
    .sort((a, b) => a.responseTime - b.responseTime);
  
  if (successfulConnections.length > 0) {
    const fastest = successfulConnections[0];
    console.log(`Using fastest mainnet RPC endpoint: ${fastest.endpoint} (${fastest.responseTime}ms)`);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('solana-rpc-url', fastest.endpoint);
    }
    
    return fastest.connection;
  }
  
  // If all endpoints failed, throw an error
  throw new Error('Failed to connect to Solana network. Please try again later.');
} 