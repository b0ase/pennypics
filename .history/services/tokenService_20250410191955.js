import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  transfer,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
    
    // Create the token mint
    const mint = await createMint(
      connection,
      payer,               // Payer of the transaction and initialization fees
      TOKEN_AUTHORITY_KEYPAIR.publicKey, // Mint authority
      TOKEN_AUTHORITY_KEYPAIR.publicKey, // Freeze authority (same as mint authority)
      PENNYPICS_TOKEN_DECIMALS          // Decimals
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
    
    // Mint a billion tokens to the authority (for distribution)
    const mintSignature = await mintTo(
      connection,
      payer,                          // Payer
      mint,                           // Token mint 
      tokenAccount.address,           // Destination account
      TOKEN_AUTHORITY_KEYPAIR,        // Mint authority (minter)
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
 * Sells tokens to a user
 */
export async function sellTokens(connection, buyer, amount) {
  try {
    // Amount in tokens
    const tokenAmount = TOKENS_PER_PURCHASE;
    // Price in SOL
    const solCost = TOKEN_COST_SOL * tokenAmount;
    
    // First check if token account exists for buyer
    const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      buyer,
      PENNYPICS_TOKEN_MINT,
      buyer.publicKey
    );
    
    // Transfer tokens from the authority account to the buyer
    const transferSignature = await transfer(
      connection,
      buyer, // Will pay transaction fee
      authorityTokenAccount.address,
      buyerTokenAccount.address,
      TOKEN_AUTHORITY_KEYPAIR, // Authority to spend from source account
      tokenAmount
    );
    
    return {
      success: true,
      signature: transferSignature,
      tokenAmount,
      solCost
    };
    
  } catch (error) {
    console.error("Error selling tokens:", error);
    throw new Error(`Token sale failed: ${error.message}`);
  }
} 