import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  SendTransactionError
} from '@solana/web3.js';

// The wallet address that will receive the payment
const PAYMENT_RECEIVER_ADDRESS = '4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB'; // Real Solana address in base58 format

// Convert SOL to lamports (1 SOL = 1 billion lamports)
export const SOL_TO_LAMPORTS = LAMPORTS_PER_SOL;

// Payment amount for image generation (0.001 SOL)
export const PAYMENT_AMOUNT = 0.001 * SOL_TO_LAMPORTS;

/**
 * Create and send a Solana transaction to pay for image generation
 * @param {Object} connection - Solana connection object
 * @param {Object} wallet - User's wallet
 * @returns {Promise<Object>} Transaction result
 */
export const sendPaymentTransaction = async (connection, wallet) => {
  try {
    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    console.log("Starting payment transaction with connected wallet:", wallet.publicKey.toString());
    
    // Skip balance check as it's causing issues
    // We'll let the blockchain validate if there are sufficient funds
    console.log("Proceeding with transaction for wallet:", wallet.publicKey.toString());
    
    try {
      // Create a new transaction
      const transaction = new Transaction();

      // Create receiver public key
      const receiverPublicKey = new PublicKey(PAYMENT_RECEIVER_ADDRESS);
      
      console.log("Sending payment to:", PAYMENT_RECEIVER_ADDRESS);
      console.log("Payment amount:", PAYMENT_AMOUNT / LAMPORTS_PER_SOL, "SOL");

      // Add a transfer instruction to the transaction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: receiverPublicKey,
          lamports: PAYMENT_AMOUNT
        })
      );

      // Get the latest blockhash with retry for better reliability
      let blockhash;
      try {
        const { blockhash: latestBlockhash } = await connection.getLatestBlockhash('finalized');
        blockhash = latestBlockhash;
      } catch (e) {
        console.log("Error getting blockhash, retrying:", e);
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { blockhash: retryBlockhash } = await connection.getLatestBlockhash('finalized');
        blockhash = retryBlockhash;
      }
      
      console.log("Got blockhash:", blockhash);
      
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign the transaction
      console.log("Requesting wallet signature...");
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send the transaction
      console.log("Sending signed transaction...");
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true // Skip simulation for better reliability
      });
      console.log('Transaction sent with signature:', signature);
  
      // Confirm the transaction
      console.log("Confirming transaction...");
      const confirmation = await connection.confirmTransaction({
        signature, 
        blockhash,
        lastValidBlockHeight: 1000000000 // Large value to prevent timeout
      }, 'processed');
      
      console.log("Transaction confirmed:", confirmation);
  
      return {
        success: true,
        signature,
        confirmation
      };
    } catch (txError) {
      // Handle transaction errors specifically
      console.error('Transaction error:', txError);
      
      // Try to extract a user-friendly error message
      let errorMessage = "Transaction failed";
      
      if (txError instanceof SendTransactionError) {
        errorMessage = `Transaction error: ${txError.message}`;
        
        if (txError.logs) {
          console.error('Transaction logs:', txError.logs);
        }
      } else if (txError.message) {
        errorMessage = txError.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error) {
    console.error('Payment process failed:', error);
    
    return {
      success: false,
      error: error.message || "Unknown payment error"
    };
  }
}; 