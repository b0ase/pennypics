import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  BlockheightBasedTransactionConfirmationStrategy
} from '@solana/web3.js';

// Parse IMAGE_COST from environment variable, with a fallback
const rawImageCost = process.env.NEXT_PUBLIC_IMAGE_COST || '0.001';
export let IMAGE_COST = parseFloat(rawImageCost);

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
 * Creates and sends a payment transaction for IMAGE CREDITS
 */
export async function payForImageCredits(wallet, connection, solAmount) {
  console.log(`CREDIT_PAYMENT: Requesting payment of ${solAmount} SOL for credits.`);
  // We can reuse the core logic of payForImageGeneration, just with a variable amount
  // For now, let's duplicate and modify slightly for clarity
  
  console.log("Using Solana network:", SOLANA_NETWORK);
  console.log("Using RPC endpoint:", connection.rpcEndpoint);
  
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    if (!wallet.signTransaction) throw new Error('Wallet does not support transactions');

    console.log("CREDIT_PAYMENT: Creating transaction to recipient:", RECIPIENT_WALLET.toString());
    
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
    if (lamports <= 0) throw new Error('Invalid payment amount for credits.');
    console.log(`CREDIT_PAYMENT: Amount in lamports: ${lamports}`);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: RECIPIENT_WALLET,
        lamports,
      })
    );

    console.log("CREDIT_PAYMENT: Getting latest finalized blockhash...");
    let blockhash, lastValidBlockHeight;
    try {
      ({ blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')); 
      console.log("CREDIT_PAYMENT: Successfully fetched finalized blockhash:", blockhash, "Last Valid Height:", lastValidBlockHeight);
    } catch (rpcError) {
      console.error("CREDIT_PAYMENT: Failed to get finalized blockhash:", rpcError);
      throw new Error('Failed to get blockhash for credit payment. Check RPC connection.');
    }
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    let signature = null;
    try {
      if (wallet.signAndSendTransaction) {
        console.log("CREDIT_PAYMENT: Using wallet.signAndSendTransaction...");
        const signed = await wallet.signAndSendTransaction(transaction);
        signature = signed.signature;
        console.log("CREDIT_PAYMENT: Transaction sent. Signature:", signature);
      } else {
        console.log("CREDIT_PAYMENT: Using traditional sign and send approach...");
        const signedTransaction = await wallet.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: false, preflightCommitment: 'finalized' });
        console.log("CREDIT_PAYMENT: Transaction sent. Signature:", signature);
      }

      console.log(`CREDIT_PAYMENT: Attempting to confirm transaction ${signature} (finalized)...`);
      const strategy = { signature, blockhash, lastValidBlockHeight };
      const confirmation = await connection.confirmTransaction(strategy, 'finalized');
      console.log(`CREDIT_PAYMENT: Transaction ${signature} finalized. Result:`, confirmation);
      
      if (confirmation.value.err) {
        console.error("CREDIT_PAYMENT: Solana transaction confirmation error:", confirmation.value.err);
        throw new Error('Credit payment transaction failed after sending.');
      }

      return { success: true, signature, confirmation };

    } catch (signSendConfirmError) {
      console.error("CREDIT_PAYMENT: Error during signing, sending, or confirming:", signSendConfirmError);
       if (signature) {
         throw new Error(`Credit payment sent (sig: ${signature.slice(0,8)}...) but confirmation failed: ${signSendConfirmError.message}`);
      } else {
         throw new Error(`Credit payment failed during signing or sending: ${signSendConfirmError.message}`);
      }
    }
  } catch (error) {
    console.error('Credit payment error:', error);
    throw new Error(error.message || 'Failed to process credit payment'); 
  }
}

/**
 * Checks if user has enough SOL to generate an image OR BUY CREDITS
 */
export async function checkBalance(wallet, connection, requiredSolAmount = IMAGE_COST) {
  if (!wallet || !wallet.publicKey) {
    console.error("CHECK_BALANCE: Called with no wallet or public key.");
    return false;
  }
  
  const publicKeyStr = wallet.publicKey.toString();
  console.log(`CHECK_BALANCE: Checking balance for wallet: ${publicKeyStr}`);
  console.log(`CHECK_BALANCE: Using RPC endpoint: ${connection.rpcEndpoint}`);
  
  try {
    console.log("CHECK_BALANCE: Requesting balance from RPC...");
    const balance = await connection.getBalance(wallet.publicKey, 'finalized');
    console.log(`CHECK_BALANCE: Raw balance received (lamports): ${balance}`);
    
    const requiredLamports = requiredSolAmount * LAMPORTS_PER_SOL;
    const hasEnough = balance >= requiredLamports;
    
    console.log(`CHECK_BALANCE: Wallet balance (SOL): ${balance / LAMPORTS_PER_SOL}`);
    console.log(`CHECK_BALANCE: Required balance (SOL): ${requiredSolAmount}`);
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
