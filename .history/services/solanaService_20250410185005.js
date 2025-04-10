import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from '@solana/web3.js';

// Parse IMAGE_COST from environment variable, with a fallback
const rawImageCost = process.env.NEXT_PUBLIC_IMAGE_COST || '0.001';
export const IMAGE_COST = parseFloat(rawImageCost);

// Validate the parsed cost
if (isNaN(IMAGE_COST) || IMAGE_COST <= 0) {
  console.error(`Invalid NEXT_PUBLIC_IMAGE_COST value: ${rawImageCost}. Using default 0.001.`);
  IMAGE_COST = 0.001; // Fallback to default if invalid
}

// Use mainnet-beta in production, devnet for testing
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
// Use the RPC endpoint specified in the environment variable, or default to cluster API
const SOLANA_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// Recipient wallet address - replace with your actual wallet address
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
  console.log("Using Solana network:", SOLANA_NETWORK);
  console.log("Using RPC endpoint:", connection.rpcEndpoint);
  
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

    // Get the latest blockhash
    console.log("Getting latest blockhash...");
    let blockhash, lastValidBlockHeight;
    try {
      ({ blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed'));
      console.log("Successfully fetched blockhash:", blockhash);
    } catch (rpcError) {
      console.error("Failed to get blockhash:", rpcError);
      let errorMessage = 'Failed to get recent blockhash. Check RPC connection.';
      if (rpcError instanceof Error && rpcError.message.includes('403')) {
        errorMessage = 'Failed to get blockhash: RPC access forbidden (403). Check API key/permissions.';
      }
      throw new Error(errorMessage);
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
    throw new Error(error.message || 'Failed to process payment'); 
  }
}

/**
 * Checks if user has enough SOL to generate an image
 */
export async function checkBalance(wallet, connection) {
  if (!wallet || !wallet.publicKey) {
    console.error("CHECK_BALANCE: Called with no wallet or public key.");
    return false;
  }
  
  const publicKeyStr = wallet.publicKey.toString();
  console.log(`CHECK_BALANCE: Checking balance for wallet: ${publicKeyStr}`);
  console.log(`CHECK_BALANCE: Using RPC endpoint: ${connection.rpcEndpoint}`);
  
  try {
    console.log("CHECK_BALANCE: Requesting balance from RPC...");
    const balance = await connection.getBalance(wallet.publicKey, 'confirmed');
    console.log(`CHECK_BALANCE: Raw balance received (lamports): ${balance}`);
    
    const requiredLamports = IMAGE_COST * LAMPORTS_PER_SOL;
    const hasEnough = balance >= requiredLamports;
    
    console.log(`CHECK_BALANCE: Wallet balance (SOL): ${balance / LAMPORTS_PER_SOL}`);
    console.log(`CHECK_BALANCE: Required balance (SOL): ${IMAGE_COST}`);
    console.log(`CHECK_BALANCE: Required balance (lamports): ${requiredLamports}`);
    console.log(`CHECK_BALANCE: Comparison: ${balance} >= ${requiredLamports} ? ${hasEnough}`);
    console.log(`CHECK_BALANCE: Returning hasEnough: ${hasEnough}`);
    
    return hasEnough;
  } catch (error) {
    console.error(`CHECK_BALANCE: Error during getBalance for ${publicKeyStr}:`, error);
    // It's better to throw here so the UI knows the check failed, rather than silently returning false.
    throw new Error(`Failed to check balance for ${publicKeyStr} due to RPC issue. Error: ${error.message}`);
  }
}
