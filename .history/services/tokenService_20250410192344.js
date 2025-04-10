import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  Keypair,
  SystemProgram
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  transfer,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  LAMPORTS_PER_SOL
} from '@solana/spl-token';

// PennyPics token constants
export const PENNYPICS_TOKEN_SYMBOL = "PENNY";
export const PENNYPICS_TOKEN_NAME = "PennyPics Token";
export const PENNYPICS_TOKEN_DECIMALS = 0; // No decimal places needed for credits
export const PENNYPICS_TOKEN_TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

// Cost for 1 token/credit in SOL
export const TOKEN_COST_SOL = 0.001;

// Number of tokens per purchase
export const TOKENS_PER_PURCHASE = 10;

// Token authority (we'll need the private key to mint more tokens)
// For testing, we'll generate a new keypair, but in production you'd load this from a secure place
const TOKEN_AUTHORITY_KEYPAIR = Keypair.generate();
console.log('Generated keypair for testing. DO NOT USE IN PRODUCTION.');
console.log('Public key:', TOKEN_AUTHORITY_KEYPAIR.publicKey.toString());

// In a real app, you'd load this from a secure location or admin interface
export const PENNYPICS_TOKEN_MINT = new PublicKey('INSERT_ACTUAL_TOKEN_MINT_HERE_AFTER_CREATION');

/**
 * Creates the PennyPics token with a billion supply
 * NOTE: This function should be called once by an admin, not from the regular UI
 */
export async function createPennyPicsToken(connection, payer) {
  try {
    console.log("TOKEN_CREATE: Starting PennyPics token creation...");
    
    // This will be the token's mint (address)
    const mintKeypair = Keypair.generate();
    console.log("TOKEN_CREATE: Generated mint keypair:", mintKeypair.publicKey.toString());
    
    // The payer of the transaction and initial mint authority - your connected wallet 
    const payerPublicKey = payer.publicKey;
    
    console.log("TOKEN_CREATE: Creating token mint with payer:", payerPublicKey.toString());
    
    // Create the token mint - with payer as mint authority
    // This way the payer (admin wallet) has control, not our ephemeral TOKEN_AUTHORITY_KEYPAIR
    const mint = await createMint(
      connection,
      payer,               // Payer of the transaction and initialization fees
      payerPublicKey,      // Mint authority - using admin's wallet for simplicity
      null,                // Freeze authority - null for now, can be added later
      PENNYPICS_TOKEN_DECIMALS // Decimals
    );
    
    console.log("TOKEN_CREATE: Token mint created:", mint.toString());
    
    // Create the payer's token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payerPublicKey
    );
    
    console.log("TOKEN_CREATE: Token account created:", tokenAccount.address.toString());
    
    // Mint a billion tokens directly to the payer/admin account
    // Since payer is the mint authority, they can mint tokens directly
    const mintSignature = await mintTo(
      connection,
      payer,                          // Payer
      mint,                           // Token mint 
      tokenAccount.address,           // Destination account
      payer,                          // Mint authority (now the payer wallet)
      PENNYPICS_TOKEN_TOTAL_SUPPLY    // Amount to mint
    );
    
    console.log("TOKEN_CREATE: Minted initial supply:", PENNYPICS_TOKEN_TOTAL_SUPPLY);
    console.log("TOKEN_CREATE: Mint signature:", mintSignature);
    
    // Return the newly created token details
    return {
      mint: mint.toString(),
      tokenAccount: tokenAccount.address.toString(),
      mintSignature,
      decimals: PENNYPICS_TOKEN_DECIMALS,
      symbol: PENNYPICS_TOKEN_SYMBOL,
      name: PENNYPICS_TOKEN_NAME
    };
    
  } catch (error) {
    console.error("TOKEN_CREATE: Error creating token:", error);
    throw new Error(`Token creation failed: ${error.message}`);
  }
}

/**
 * Gets a user's token balance
 */
export async function getTokenBalance(connection, walletPublicKey) {
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      null, // We're not sending a transaction, so payer can be null
      PENNYPICS_TOKEN_MINT,
      walletPublicKey
    );
    
    const accountInfo = await getAccount(
      connection,
      tokenAccount.address
    );
    
    return Number(accountInfo.amount);
  } catch (error) {
    console.error("Error getting token balance:", error);
    // If account doesn't exist yet, balance is 0
    if (error.message.includes("Account does not exist")) {
      return 0;
    }
    throw error;
  }
}

/**
 * Sells tokens to a user by accepting SOL payment and transferring tokens
 * NOTE: This assumes your admin wallet (seller) already has tokens to sell 
 * and you've updated the PENNYPICS_TOKEN_MINT with your actual token mint address
 */
export async function sellTokens(connection, buyer, seller) {
  try {
    // Standard amount in tokens
    const tokenAmount = TOKENS_PER_PURCHASE;
    
    // Price in SOL
    const solCost = TOKEN_COST_SOL * tokenAmount;
    console.log(`TOKEN_SELL: Selling ${tokenAmount} tokens for ${solCost} SOL`);
    
    // 1. First, create a SOL payment transaction from buyer to seller
    const lamports = Math.floor(solCost * LAMPORTS_PER_SOL);
    
    const paymentTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyer.publicKey,
        toPubkey: seller.publicKey,
        lamports,
      })
    );
    
    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    paymentTransaction.recentBlockhash = blockhash;
    paymentTransaction.feePayer = buyer.publicKey;
    
    // Sign and send the payment transaction
    const paymentSignature = await connection.sendTransaction(paymentTransaction, [buyer]);
    console.log(`TOKEN_SELL: Payment sent. Signature: ${paymentSignature}`);
    
    // 2. After payment, get token accounts for both buyer and seller
    const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      buyer, // The buyer pays to create their token account if it doesn't exist
      PENNYPICS_TOKEN_MINT,
      buyer.publicKey
    );
    
    const sellerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      seller, // The seller pays to create their token account if it doesn't exist
      PENNYPICS_TOKEN_MINT,
      seller.publicKey
    );
    
    // 3. Transfer tokens from seller to buyer
    const tokenTransferSignature = await transfer(
      connection,
      seller, // Seller pays for this transaction fee
      sellerTokenAccount.address, // From seller's token account
      buyerTokenAccount.address,  // To buyer's token account
      seller,  // Seller must sign to authorize the transfer
      tokenAmount // Number of tokens to transfer
    );
    
    console.log(`TOKEN_SELL: Tokens transferred. Signature: ${tokenTransferSignature}`);
    
    return {
      success: true,
      paymentSignature,
      tokenTransferSignature,
      tokenAmount,
      solCost
    };
  } catch (error) {
    console.error("TOKEN_SELL: Error selling tokens:", error);
    throw new Error(`Token sale failed: ${error.message}`);
  }
} 