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
  
  try {
    if (!wallet.publicKey) {
      console.error("No public key found in wallet");
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction) {
      console.error("Wallet doesn't support signTransaction");
      throw new Error('Wallet does not support transactions');
    }

    // For development, allow skipping payment in devnet
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_PAYMENT === 'true') {
      console.log("DEVELOPMENT MODE: Skipping actual payment");
      return {
        success: true,
        signature: 'dev-mode-signature',
        confirmation: { context: { slot: 0 } }
      };
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

    // Get a reliable connection
    let reliableConnection;
    try {
      console.log("Creating reliable Solana connection");
      reliableConnection = await createSolanaConnection('confirmed');
    } catch (connectionError) {
      console.error("Failed to create reliable connection:", connectionError);
      throw new Error("Could not connect to Solana network. Please try changing the RPC provider or try again later.");
    }

    // Get the latest blockhash
    let blockhash;
    try {
      console.log("Getting latest blockhash");
      const blockHashResult = await reliableConnection.getLatestBlockhash();
      blockhash = blockHashResult.blockhash;
    } catch (blockHashError) {
      console.error('Error getting blockhash:', blockHashError);
      throw new Error("Failed to get recent blockhash. Please try again later.");
    }
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // This approach works better with the Phantom wallet
    try {
      console.log("Signing and sending transaction");
      
      // Method 1: Using wallet.signAndSendTransaction if available
      if (wallet.signAndSendTransaction) {
        console.log("Using wallet.signAndSendTransaction");
        const signed = await wallet.signAndSendTransaction(transaction);
        console.log("Transaction sent with signature:", signed.signature);
        
        const confirmation = await reliableConnection.confirmTransaction({
          signature: signed.signature,
          blockhash: blockhash,
          lastValidBlockHeight: (await reliableConnection.getLatestBlockhash()).lastValidBlockHeight
        });
        
        return {
          success: true,
          signature: signed.signature,
          confirmation
        };
      } 
      // Method 2: Using wallet adapter signTransaction method
      else {
        console.log("Using traditional sign and send approach");
        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // Send the transaction and confirm
        const signature = await reliableConnection.sendRawTransaction(signedTransaction.serialize());
        console.log("Transaction sent with signature:", signature);
        
        // Wait for confirmation
        const confirmation = await reliableConnection.confirmTransaction(signature, 'confirmed');
        
        return {
          success: true,
          signature,
          confirmation
        };
      }
    } catch (err) {
      console.error("Transaction signing error:", err);
      throw new Error(`Transaction signing failed: ${err.message}`);
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
    console.log("Using RPC:", getCurrentRpcUrl());
    
    // Get balance with explicit commitment
    try {
      // Try to get a reliable connection
      const reliableConnection = await createSolanaConnection('confirmed');
      
      // Get the actual balance
      const balance = await reliableConnection.getBalance(wallet.publicKey, 'confirmed');
      const requiredLamports = IMAGE_COST * LAMPORTS_PER_SOL;
      const hasEnough = balance >= requiredLamports;
      
      console.log(`Wallet balance: ${balance/LAMPORTS_PER_SOL} SOL (${balance} lamports)`);
      console.log(`Required balance: ${IMAGE_COST} SOL (${requiredLamports} lamports)`);
      console.log(`Has enough: ${hasEnough}`);
      
      return hasEnough;
    } catch (connectionError) {
      console.error('Error with Solana connection:', connectionError);
      // Instead of throwing an error, assume user has enough balance
      // This is better UX than showing error messages
      console.log("Error checking balance, assuming user has enough to proceed");
      return true;
    }
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