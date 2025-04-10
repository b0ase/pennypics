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
  
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support transactions');
    }

    // Create transaction to send SOL from user to recipient
    const lamports = Math.floor(IMAGE_COST * LAMPORTS_PER_SOL);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: RECIPIENT_WALLET,
        lamports,
      })
    );

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    try {
      // Sign and send the transaction
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      return {
        success: true,
        signature,
        confirmation
      };
    } catch (err) {
      console.error("Transaction error:", err);
      throw new Error(`Transaction failed: ${err.message}`);
    }
  } catch (error) {
    console.error('Payment error:', error);
    throw new Error(error.message || 'Failed to process payment');
  }
}

/**
 * Check if a wallet has sufficient balance for image generation
 */
export async function checkBalance(wallet, connection) {
  try {
    if (!wallet.publicKey) {
      console.log("No public key found in wallet");
      return false;
    }
    
    console.log("Checking balance for wallet:", wallet.publicKey.toString());
    
    // Try to get balance with retries
    let balance = null;
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        // Get the balance with a timeout
        balance = await Promise.race([
          connection.getBalance(wallet.publicKey),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Balance check timeout')), 5000)
          )
        ]);
        
        if (balance !== null) {
          break;
        }
      } catch (err) {
        console.error(`Attempt ${attempts + 1} failed:`, err);
        lastError = err;
        attempts++;
        
        if (attempts < maxAttempts) {
          // Wait before retrying, increasing delay with each attempt
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }
    
    if (balance === null) {
      throw lastError || new Error('Could not retrieve wallet balance after multiple attempts');
    }
    
    const requiredLamports = Math.floor(IMAGE_COST * LAMPORTS_PER_SOL);
    
    console.log(`Current balance: ${balance/LAMPORTS_PER_SOL} SOL (${balance} lamports)`);
    console.log(`Required balance: ${IMAGE_COST} SOL (${requiredLamports} lamports)`);
    console.log(`Has enough balance: ${balance >= requiredLamports}`);
    
    return balance >= requiredLamports;
  } catch (error) {
    console.error('Error checking balance:', error);
    // Try to create a new connection if the current one failed
    try {
      const newConnection = new Connection('https://api.mainnet-beta.solana.com', {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 30000
      });
      
      const balance = await newConnection.getBalance(wallet.publicKey);
      const requiredLamports = Math.floor(IMAGE_COST * LAMPORTS_PER_SOL);
      
      console.log(`Retry balance check successful: ${balance/LAMPORTS_PER_SOL} SOL`);
      return balance >= requiredLamports;
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
      throw new Error('Unable to check wallet balance. Please try again later.');
    }
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