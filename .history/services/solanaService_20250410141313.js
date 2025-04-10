import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

// The cost of one image generation in SOL
export const IMAGE_COST = 0.001;

// Recipient wallet address (replace with your actual wallet address)
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
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create a transaction to send SOL from the user to the recipient
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: RECIPIENT_WALLET,
        lamports: IMAGE_COST * LAMPORTS_PER_SOL,
      })
    );

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send the transaction and confirm
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    return {
      success: true,
      signature,
      confirmation
    };
  } catch (error) {
    console.error('Payment error:', error);
    throw new Error(error.message || 'Failed to process payment');
  }
}

/**
 * Checks if user has enough SOL to generate an image
 */
export async function checkBalance(wallet, connection) {
  if (!wallet.publicKey) return false;
  
  try {
    const balance = await connection.getBalance(wallet.publicKey);
    return balance >= IMAGE_COST * LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
} 