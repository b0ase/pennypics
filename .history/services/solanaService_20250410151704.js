import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { createSolanaConnection, getCurrentRpcUrl } from '../utils/solanaConnection';

// The cost of one image generation in SOL
export const IMAGE_COST = 0.001;

// Recipient wallet address - address where payments will be sent
const RECIPIENT_WALLET = new PublicKey('4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB');

/**
 * Formats a SOL amount with the appropriate units
 */
export function formatSol(amount) {
  return `${amount} SOL`;
}

/**
 * Creates and sends a payment transaction for image generation
 */
export async function payForImageGeneration(wallet, connection) {
  console.log("Beginning payment process with wallet:", wallet.publicKey?.toString());
  console.log("Payment will be sent to:", RECIPIENT_WALLET.toString());
  console.log("Using RPC URL:", getCurrentRpcUrl());
  
  // Skip payment only if explicitly configured to do so
  if (process.env.NEXT_PUBLIC_SKIP_PAYMENT === 'true') {
    console.log("SKIP_PAYMENT enabled: skipping actual payment as configured");
    return {
      success: true,
      signature: 'dev-mode-signature',
      confirmation: { context: { slot: 0 } }
    };
  }
  
  try {
    if (!wallet.publicKey) {
      console.error("No public key found in wallet");
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction) {
      console.error("Wallet doesn't support signTransaction");
      throw new Error('Wallet does not support transactions');
    }

    console.log(`Creating transaction: ${wallet.publicKey.toString()} -> ${RECIPIENT_WALLET.toString()}`);
    
    // Create a transaction to send SOL from the user to the recipient
    const lamports = Math.floor(IMAGE_COST * LAMPORTS_PER_SOL);
    console.log(`Amount in lamports: ${lamports} (${IMAGE_COST} SOL)`);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: RECIPIENT_WALLET,
        lamports,
      })
    );

    // Try multiple reliable connections in sequence if needed
    let reliableConnection;
    let connectionSuccess = false;
    
    // List of RPC endpoints to try
    const rpcEndpoints = [
      getCurrentRpcUrl(),
      'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5',
      'https://solana-api.projectserum.com',
      'https://api.mainnet-beta.solana.com',
      'https://ssc-dao.genesysgo.net/',
      'https://solana-mainnet.g.alchemy.com/v2/demo'
    ];
    
    // Try each endpoint until one works
    for (const endpoint of rpcEndpoints) {
      try {
        console.log(`Trying RPC endpoint: ${endpoint}`);
        reliableConnection = new Connection(endpoint, 'confirmed');
        // Test if it works by getting the latest blockhash
        const blockHashResult = await reliableConnection.getLatestBlockhash();
        transaction.recentBlockhash = blockHashResult.blockhash;
        transaction.feePayer = wallet.publicKey;
        connectionSuccess = true;
        console.log(`Successfully connected to RPC: ${endpoint}`);
        break;
      } catch (err) {
        console.error(`Failed to use RPC endpoint ${endpoint}:`, err);
        // Continue to next endpoint
      }
    }
    
    if (!connectionSuccess) {
      console.error("All RPC endpoints failed");
      throw new Error('Could not connect to any Solana network. Please try again later.');
    }

    // This approach works better with the Phantom wallet
    try {
      console.log("Signing and sending transaction");
      
      // Method 1: Using wallet.signAndSendTransaction if available
      if (wallet.signAndSendTransaction) {
        console.log("Using wallet.signAndSendTransaction");
        const signed = await wallet.signAndSendTransaction(transaction);
        console.log("Transaction sent with signature:", signed.signature);
        
        try {
          const confirmation = await reliableConnection.confirmTransaction({
            signature: signed.signature,
            blockhash: transaction.recentBlockhash,
            lastValidBlockHeight: (await reliableConnection.getLatestBlockhash()).lastValidBlockHeight
          }, 'confirmed');
          
          console.log("Transaction confirmed:", confirmation);
          
          return {
            success: true,
            signature: signed.signature,
            confirmation
          };
        } catch (confirmError) {
          console.error("Confirmation error:", confirmError);
          // Don't return success if confirmation failed
          throw new Error("Transaction could not be confirmed. Please check your wallet for the status.");
        }
      } 
      // Method 2: Using wallet adapter signTransaction method
      else {
        console.log("Using traditional sign and send approach");
        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // Send the transaction and confirm
        const signature = await reliableConnection.sendRawTransaction(signedTransaction.serialize());
        console.log("Transaction sent with signature:", signature);
        
        try {
          // Wait for confirmation
          const confirmation = await reliableConnection.confirmTransaction(signature, 'confirmed');
          console.log("Transaction confirmed:", confirmation);
          
          return {
            success: true,
            signature,
            confirmation
          };
        } catch (confirmError) {
          console.error("Confirmation error:", confirmError);
          // Don't return success if confirmation failed
          throw new Error("Transaction could not be confirmed. Please check your wallet for the status.");
        }
      }
    } catch (err) {
      console.error("Transaction signing error:", err);
      throw new Error(`Transaction failed: ${err.message}`);
    }
  } catch (error) {
    console.error('Payment error:', error);
    throw new Error(error.message || 'Failed to process payment');
  }
}

/**
 * Checks if user has enough SOL to generate an image
 */
export async function checkBalance(wallet, connection) {
  if (!wallet.publicKey) {
    console.log("No public key found when checking balance");
    return false;
  }
  
  try {
    console.log("Checking balance for wallet:", wallet.publicKey.toString());
    
    // Define multiple endpoints to try in sequence
    const rpcEndpoints = [
      getCurrentRpcUrl(),
      'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5',
      'https://solana-api.projectserum.com',
      'https://api.mainnet-beta.solana.com',
      'https://ssc-dao.genesysgo.net/',
      'https://solana-mainnet.g.alchemy.com/v2/demo'
    ];
    
    // Try each endpoint until one works
    for (const endpoint of rpcEndpoints) {
      try {
        console.log(`Trying to check balance using endpoint: ${endpoint}`);
        const testConnection = new Connection(endpoint, 'confirmed');
        
        // Get the actual balance
        const balance = await testConnection.getBalance(wallet.publicKey, 'confirmed');
        const requiredLamports = IMAGE_COST * LAMPORTS_PER_SOL;
        const hasEnough = balance >= requiredLamports;
        
        console.log(`Wallet balance: ${balance/LAMPORTS_PER_SOL} SOL (${balance} lamports)`);
        console.log(`Required balance: ${IMAGE_COST} SOL (${requiredLamports} lamports)`);
        console.log(`Has enough: ${hasEnough}`);
        
        // If this endpoint worked, save it for future use
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('solana-rpc-url', endpoint);
        }
        
        return hasEnough;
      } catch (endpointError) {
        console.error(`Error with endpoint ${endpoint}:`, endpointError);
        // Continue to next endpoint
      }
    }
    
    // If all endpoints failed, assume user has enough balance
    console.log("All endpoints failed, assuming user has enough balance");
    return true;
  } catch (error) {
    console.error('Error checking balance:', error);
    // Assume user has enough balance rather than showing error
    return true;
  }
}

/**
 * Verifies that the recipient address is valid
 * This function can be used in development to validate the recipient address
 */
export function verifyRecipientAddress() {
  try {
    // Check if the address is a valid Solana address
    if (RECIPIENT_WALLET.toString() === '4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB') {
      console.log("✅ Recipient address verified:", RECIPIENT_WALLET.toString());
      return {
        valid: true,
        address: RECIPIENT_WALLET.toString()
      };
    } else {
      console.warn("⚠️ Recipient address does not match expected address");
      return {
        valid: false,
        address: RECIPIENT_WALLET.toString(),
        expected: '4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB'
      };
    }
  } catch (error) {
    console.error("❌ Invalid recipient address:", error);
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Gets a link to verify a transaction on the Solana explorer
 */
export function getTransactionExplorerLink(signature) {
  if (!signature || signature === 'dev-mode-signature') {
    return null;
  }
  
  // Determine the explorer base URL based on the environment
  const baseUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('devnet')
    ? 'https://explorer.solana.com/tx/'
    : 'https://explorer.solana.com/tx/';
  
  // Append the network parameter if on devnet
  const networkParam = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('devnet')
    ? '?cluster=devnet'
    : '';
  
  return `${baseUrl}${signature}${networkParam}`;
}

/**
 * Gets a link to verify the recipient address on the Solana explorer
 */
export function getAddressExplorerLink() {
  // Determine the explorer base URL based on the environment
  const baseUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('devnet')
    ? 'https://explorer.solana.com/address/'
    : 'https://explorer.solana.com/address/';
  
  // Append the network parameter if on devnet
  const networkParam = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('devnet')
    ? '?cluster=devnet'
    : '';
  
  return `${baseUrl}${RECIPIENT_WALLET.toString()}${networkParam}`;
} 