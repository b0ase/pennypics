import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// List of reliable public RPC endpoints for mainnet
export const RPC_ENDPOINTS = [
  { id: 'mainnet', name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
  { id: 'helius', name: 'Helius', url: 'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5' },
  { id: 'serum', name: 'Project Serum', url: 'https://solana-api.projectserum.com' }
];

// Official mainnet endpoint
const MAINNET_ENDPOINT = 'https://api.mainnet-beta.solana.com';

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
 * Create a Solana connection
 */
export async function createSolanaConnection(commitment = 'confirmed') {
  console.log("Creating mainnet connection...");
  return new Connection(MAINNET_ENDPOINT, {
    commitment,
    confirmTransactionInitialTimeout: 30000
  });
} 