import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  SendTransactionError,
  ComputeBudgetProgram,
  clusterApiUrl
} from '@solana/web3.js';

// The wallet address that will receive the payment
const PAYMENT_RECEIVER_ADDRESS = '4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB'; // Real Solana address in base58 format

// Convert SOL to lamports (1 SOL = 1 billion lamports)
export const SOL_TO_LAMPORTS = LAMPORTS_PER_SOL;

// Payment amount for image generation (0.001 SOL)
export const PAYMENT_AMOUNT = 0.001 * SOL_TO_LAMPORTS;

// Priority fee to make transactions more likely to be processed quickly
const PRIORITY_FEE_MICROLAMPORTS = 100_000; // 0.0001 SOL

/**
 * Get latest blockhash with retry logic
 */
async function getLatestBlockhashWithRetry(connection, retries = 3) {
  let attempt = 0;
  let error = null;
  
  while (attempt < retries) {
    try {
      attempt++;
      console.log(`Getting blockhash (attempt ${attempt}/${retries})...`);
      
      // Try to get blockhash with increased priority
      const result = await connection.getLatestBlockhash('confirmed');
      console.log("Got blockhash successfully:", result.blockhash.substring(0, 8) + "...");
      return result;
    } catch (err) {
      error = err;
      console.warn(`Blockhash fetch attempt ${attempt} failed:`, err.message);
      
      // Only wait if we're going to retry
      if (attempt < retries) {
        const delay = Math.min(1000 * attempt, 3000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  console.error(`Failed to get blockhash after ${retries} attempts`);
  throw error;
}

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
    
    // Verify connection is working by checking the recent block 
    try {
      console.log("Testing connection by fetching current slot...");
      const slot = await connection.getSlot();
      console.log("Connection working! Current slot:", slot);
    } catch (connErr) {
      console.error("Connection test failed:", connErr);
      
      // Try using a different endpoint as fallback
      console.log("Trying fallback to public RPC endpoint...");
      try {
        connection = new connection.constructor(
          clusterApiUrl('mainnet-beta'), 
          { commitment: 'confirmed' }
        );
        const slot = await connection.getSlot();
        console.log("Fallback connection working! Current slot:", slot);
      } catch (fallbackErr) {
        console.error("Fallback connection also failed:", fallbackErr);
        throw new Error("Unable to connect to Solana network. Please check your internet connection and try again.");
      }
    }
    
    try {
      // Create Solana transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(PAYMENT_RECEIVER_ADDRESS),
        lamports: PAYMENT_AMOUNT
      });
      
      // Add a priority fee instruction to increase chances of faster processing
      const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: PRIORITY_FEE_MICROLAMPORTS
      });
      
      console.log("Payment amount:", PAYMENT_AMOUNT / LAMPORTS_PER_SOL, "SOL");
      console.log("From address:", wallet.publicKey.toString());
      console.log("To address:", PAYMENT_RECEIVER_ADDRESS);
      console.log("Priority fee:", PRIORITY_FEE_MICROLAMPORTS / 1_000_000, "SOL");

      // Get a recent blockhash with retry logic
      const { blockhash, lastValidBlockHeight } = await getLatestBlockhashWithRetry(connection);
      console.log("Using blockhash:", blockhash, "valid until height:", lastValidBlockHeight);
      
      // Create transaction and add both instructions
      const transaction = new Transaction()
        .add(priorityFeeInstruction)  // Add priority fee instruction first
        .add(transferInstruction);    // Then add the transfer instruction
        
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Let Phantom handle the transaction 
      console.log("Sending transaction...");
      const signature = await wallet.sendTransaction(transaction, connection);
      
      console.log("Transaction sent with signature:", signature);
      console.log("Transaction URL:", `https://explorer.solana.com/tx/${signature}`);
      
      // Wait for confirmation with a more robust approach
      console.log("Waiting for confirmation...");
      try {
        // First try the preferred confirmation method with longer timeout
        try {
          const confirmation = await Promise.race([
            connection.confirmTransaction({
              signature,
              blockhash,
              lastValidBlockHeight
            }, 'confirmed'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Confirmation timeout')), 60000)
            )
          ]);
          
          if (confirmation.value?.err) {
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
          // If the preferred method fails, fall back to checking transaction status
          console.warn("Error during confirmation process, falling back to status check:", confirmError.message);
          
          // Do multiple status checks with increasing delays
          for (let attempt = 1; attempt <= 5; attempt++) {
            console.log(`Status check attempt ${attempt}/5...`);
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, attempt * 3000));
            
            // Check if the transaction was confirmed despite the confirmation process failing
            const status = await connection.getSignatureStatus(signature, {
              searchTransactionHistory: true
            });
            
            console.log("Transaction status:", status?.value?.confirmationStatus || "not found");
            
            if (status?.value?.confirmationStatus === 'confirmed' || 
                status?.value?.confirmationStatus === 'finalized') {
              console.log("Transaction confirmed through status check!");
              return {
                success: true,
                signature
              };
            } else if (status?.value?.err) {
              // Transaction was processed but had an error
              console.error("Transaction failed:", status.value.err);
              return {
                success: false,
                signature,
                error: `Transaction failed: ${JSON.stringify(status.value.err)}`
              };
            }
            
            // If last attempt, continue to throw error
            if (attempt === 5) {
              throw new Error("Transaction not confirmed after multiple attempts");
            }
          }
        }
      } catch (finalError) {
        // Both confirmation methods failed
        console.error("Transaction confirmation ultimately failed:", finalError);
        
        return {
          success: false,
          signature,
          error: `Transaction sent but confirmation failed: ${finalError.message}`
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
        } else if (errorMessage.includes('block height exceeded')) {
          errorMessage = 'Transaction expired. Please try again.';
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