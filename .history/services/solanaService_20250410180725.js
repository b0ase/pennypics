import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from '@solana/web3.js';

// Actual production cost - 0.0001 SOL for testing purposes
export const IMAGE_COST = 0.0001;

// Use mainnet-beta in production, devnet for testing
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

// Use the RPC endpoint specified in the environment variable, or default to cluster API
const SOLANA_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// Recipient wallet address - replace with your actual wallet address
const RECIPIENT_WALLET = new PublicKey('3iA3PuXBGvuYDrjtk9jYgKBHHFTRtGNBYYJ74WZP5Sq9');

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
  console.log("Using Solana network:", SOLANA_NETWORK);
  console.log("Using RPC endpoint:", SOLANA_ENDPOINT);
  
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support transactions');
    }

    console.log("Creating transaction to recipient:", RECIPIENT_WALLET.toString());
    
    // Create a transaction to send SOL from the user to the recipient
    const lamports = Math.floor(IMAGE_COST * LAMPORTS_PER_SOL);
    console.log(`Amount in lamports: ${lamports}`);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: RECIPIENT_WALLET,
        lamports,
      })
    );

    // Get the latest blockhash
    console.log("Getting latest blockhash from:", connection.rpcEndpoint);
    
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      console.log("Successfully fetched blockhash:", blockhash);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Method 1: Using wallet.signAndSendTransaction if available (most wallets support this)
      if (wallet.signAndSendTransaction) {
        console.log("Using wallet.signAndSendTransaction");
        const signed = await wallet.signAndSendTransaction(transaction);
        console.log("Transaction sent with signature:", signed.signature);
        
        const confirmation = await connection.confirmTransaction({
          signature: signed.signature,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight
        }, 'confirmed');
        
        return {
          success: true,
          signature: signed.signature,
          confirmation
        };
      } 
      // Method 2: Using wallet adapter signTransaction method
      else {
        console.log("Using traditional sign and send approach");
        const signedTransaction = await wallet.signTransaction(transaction);
        
        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        console.log("Transaction sent with signature:", signature);
        
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed');
        
        return {
          success: true,
          signature,
          confirmation
        };
      }
    } catch (rpcError) {
      console.error("RPC error during getLatestBlockhash or transaction sending:", rpcError);
      let errorMessage = 'RPC connection error. Please try again later.';
      if (rpcError instanceof Error) {
        if (rpcError.message.includes('403')) {
          errorMessage = 'RPC Error: Access Forbidden (403). Check your RPC endpoint URL and provider permissions.';
        } else if (rpcError.message.includes('Failed to fetch')) {
          errorMessage = 'RPC Error: Network request failed. Check your internet connection and RPC endpoint URL.';
        } else {
          errorMessage = `RPC Error: ${rpcError.message}`;
        }
      }
      throw new Error(errorMessage);
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
  if (!wallet || !wallet.publicKey) {
    console.log("No public key found when checking balance");
    return false;
  }
  
  try {
    console.log("Checking balance for wallet:", wallet.publicKey.toString());
    const balance = await connection.getBalance(wallet.publicKey);
    
    const requiredLamports = IMAGE_COST * LAMPORTS_PER_SOL;
    const hasEnough = balance >= requiredLamports;
    
    console.log(`Wallet balance: ${balance/LAMPORTS_PER_SOL} SOL`);
    console.log(`Wallet has enough balance: ${hasEnough}`);
    return hasEnough;
  } catch (error) {
    console.error('Balance check error:', error);
    throw new Error(error.message || 'Failed to check balance');
  }
}
