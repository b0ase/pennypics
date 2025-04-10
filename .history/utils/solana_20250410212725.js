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
    console.log("Connected to network:", connection.rpcEndpoint);
    
    try {
      // Create Solana transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(PAYMENT_RECEIVER_ADDRESS),
        lamports: PAYMENT_AMOUNT
      });
      
      console.log("Payment amount:", PAYMENT_AMOUNT / LAMPORTS_PER_SOL, "SOL");
      console.log("From address:", wallet.publicKey.toString());
      console.log("To address:", PAYMENT_RECEIVER_ADDRESS);

      // Get a recent blockhash to ensure transaction goes through
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      console.log("Using blockhash:", blockhash);
      
      // Create transaction and add the transfer instruction
      const transaction = new Transaction().add(instruction);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Let Phantom handle the transaction 
      console.log("Sending transaction...");
      const signature = await wallet.sendTransaction(transaction, connection);
      
      console.log("Transaction sent with signature:", signature);
      console.log("Transaction URL:", `https://explorer.solana.com/tx/${signature}`);
      
      // Wait for confirmation
      console.log("Waiting for confirmation...");
      try {
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed');
        
        if (confirmation.value.err) {
          console.error("Transaction confirmed but has errors:", confirmation.value.err);
          return {
            success: false,
            signature,
            error: `Transaction confirmed but failed: ${JSON.stringify(confirmation.value.err)}`
          };
        }
        
        console.log("Transaction confirmed successfully!");
        return {
          success: true,
          signature
        };
      } catch (confirmError) {
        console.error("Error confirming transaction:", confirmError);
        return {
          success: false,
          signature,
          error: `Transaction sent but confirmation failed: ${confirmError.message}`
        };
      }
    } catch (txError) {
      // Handle transaction errors
      console.error('Transaction error:', txError);
      
      // Create user-friendly error message
      let errorMessage = "Transaction failed";
      
      if (txError.message) {
        errorMessage = txError.message;
        
        // Make common error messages more user-friendly
        if (errorMessage.includes('failed to get recent blockhash')) {
          errorMessage = 'Network connection issue. Please try again.';
        } else if (errorMessage.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction.';
        } else if (errorMessage.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled.';
        }
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