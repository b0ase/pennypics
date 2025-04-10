import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
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

    // Create a new transaction
    const transaction = new Transaction();

    // Create receiver public key
    const receiverPublicKey = new PublicKey(PAYMENT_RECEIVER_ADDRESS);

    // Add a transfer instruction to the transaction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: receiverPublicKey,
        lamports: PAYMENT_AMOUNT
      })
    );

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm the transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    return {
      success: true,
      signature,
      confirmation
    };
  } catch (error) {
    console.error('Payment transaction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 