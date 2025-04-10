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
// Always use the default cluster API URL for the selected network
const SOLANA_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);

// Recipient wallet address - replace with your actual wallet address
const RECIPIENT_WALLET = new PublicKey('3iA3PuXBGvuYDrjtk9jYgKBHHFTRtGNBYYJ74WZP5Sq9');

// Helper function for retrying async operations
async function retryAsync(fn, retries = 3, delay = 1000, operationName = 'Operation') {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`${operationName} failed. Retrying (${i + 1}/${retries})... Error: ${error.message}`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`${operationName} failed after ${retries} attempts.`);
  throw lastError;
}

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
  console.log("Using RPC endpoint:", connection.rpcEndpoint); // Log the actual endpoint being used by the connection
  
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support transactions');
    }

    console.log("Creating transaction to recipient:", RECIPIENT_WALLET.toString());
    
    const lamports = Math.floor(IMAGE_COST * LAMPORTS_PER_SOL);
    console.log(`Amount in lamports: ${lamports}`);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: RECIPIENT_WALLET,
        lamports,
      })
    );

    // Get the latest blockhash with retries
    console.log("Getting latest blockhash...");
    let blockhash, lastValidBlockHeight;
    try {
      ({ blockhash, lastValidBlockHeight } = await retryAsync(
        () => connection.getLatestBlockhash('confirmed'),
        3, // retries
        1000, // delay
        'getLatestBlockhash'
      ));
      console.log("Successfully fetched blockhash:", blockhash);
    } catch (rpcError) {
      console.error("Failed to get blockhash after retries:", rpcError);
      throw new Error('Failed to get recent blockhash from public RPC. The network might be congested. Please try again later.');
    }
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send the transaction
    try {
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
      } else {
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
    } catch (signSendError) {
      console.error("Transaction signing/sending error:", signSendError);
      throw new Error(`Payment failed during signing or sending: ${signSendError.message}`);
    }
  } catch (error) {
    console.error('Payment error:', error);
    // Re-throw the specific error message
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
  
  console.log("Checking balance for wallet:", wallet.publicKey.toString());
  console.log("Using RPC endpoint for balance check:", connection.rpcEndpoint);
  
  try {
    // Get balance with retries
    const balance = await retryAsync(
      () => connection.getBalance(wallet.publicKey, 'confirmed'),
      3, // retries
      1000, // delay
      'getBalance'
    );
    
    const requiredLamports = IMAGE_COST * LAMPORTS_PER_SOL;
    const hasEnough = balance >= requiredLamports;
    
    console.log(`Wallet balance: ${balance/LAMPORTS_PER_SOL} SOL`);
    console.log(`Required balance: ${IMAGE_COST} SOL`);
    console.log(`Wallet has enough balance: ${hasEnough}`);
    
    return hasEnough;
  } catch (error) {
    // If balance check fails after retries, log it but maybe don't block the user?
    // Or throw a specific error?
    console.error('Balance check failed after retries:', error);
    // Throwing an error here will show the "Insufficient Balance" message, 
    // which might be confusing if the actual issue was the RPC.
    // Let's return false but log clearly.
    console.error("Could not confirm balance due to RPC issues after retries.");
    // To actually block the user, throw an error:
    // throw new Error('Failed to check balance due to network issues. Please try again.');
    return false; // Treat as insufficient if check fails
  }
}
