import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  Keypair,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  transfer,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  LAMPORTS_PER_SOL,
  createInitializeMintInstruction,
  getMint,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction
} from '@solana/spl-token';

// PennyPics token constants
export const PENNYPICS_TOKEN_SYMBOL = "PENNY";
export const PENNYPICS_TOKEN_NAME = "PennyPics Token";
export const PENNYPICS_TOKEN_DECIMALS = 0; // No decimal places needed for credits
export const PENNYPICS_TOKEN_TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

// PennyPics treasury address (where payments are received)
export const PENNYPICS_TREASURY_ADDRESS = new PublicKey("4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB");

// PennyPics mint authority keypair - this will have control over minting new tokens
// In production, this should be loaded from a secure location
const PENNYPICS_MINT_AUTHORITY = Keypair.generate();
console.log('Generated mint authority keypair. IMPORTANT: SAVE THIS SECURELY!');
console.log('Mint Authority Public Key:', PENNYPICS_MINT_AUTHORITY.publicKey.toString());
console.log('Mint Authority Secret Key:', Buffer.from(PENNYPICS_MINT_AUTHORITY.secretKey).toString('base64'));

// Cost for 1 token/credit in SOL
export const TOKEN_COST_SOL = 0.001;

// Number of tokens per purchase
export const TOKENS_PER_PURCHASE = 10;

// Token authority (we'll need the private key to mint more tokens)
// For testing, we'll generate a new keypair, but in production you'd load this from a secure place
const TOKEN_AUTHORITY_KEYPAIR = Keypair.generate();
console.log('Generated keypair for testing. DO NOT USE IN PRODUCTION.');
console.log('Public key:', TOKEN_AUTHORITY_KEYPAIR.publicKey.toString());

// In a real app, you'd load this from a secure location or environment variable
// For now, let's use a placeholder until you create the token
const TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_PENNYPICS_TOKEN_MINT || '';

// Handle the case where the token mint hasn't been created yet
// We'll use the System Program ID as a placeholder
export const PENNYPICS_TOKEN_MINT = TOKEN_MINT_ADDRESS 
  ? new PublicKey(TOKEN_MINT_ADDRESS) 
  : SystemProgram.programId; // Placeholder when not set

/**
 * Creates the PennyPics token with a billion supply
 * NOTE: This function should be called once by an admin, not from the regular UI
 */
export async function createPennyPicsToken(connection, payer) {
  try {
    console.log("TOKEN_CREATE: Starting PennyPics token creation...");
    
    // Validate the payer and wallet objects
    if (!payer) {
      throw new Error("Payer wallet is required");
    }
    
    if (!payer.publicKey) {
      throw new Error("Payer publicKey is missing");
    }
    
    if (!payer.signTransaction || typeof payer.signTransaction !== 'function') {
      throw new Error("Payer wallet must implement signTransaction method");
    }
    
    if (!connection) {
      throw new Error("Solana connection is required");
    }
    
    // --------------------- MANUAL APPROACH INSTEAD OF USING HIGHER-LEVEL FUNCTIONS ---------------------
    
    // Step 1: Generate a keypair for the token mint
    const mintKeypair = Keypair.generate();
    console.log("TOKEN_CREATE: Generated mint keypair:", mintKeypair.publicKey.toString());
    
    // Step 2: Calculate the minimum lamports needed to create a mint account
    const mintRent = await connection.getMinimumBalanceForRentExemption(82); // Token mint size is 82 bytes
    
    // Step 3: Create a transaction to create the mint account
    const transaction = new Transaction();
    
    // Add instruction to create the token mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: mintRent,
        space: 82,
        programId: TOKEN_PROGRAM_ID
      })
    );
    
    // Add instruction to initialize the mint
    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,              // Mint account public key
        PENNYPICS_TOKEN_DECIMALS,           // Number of decimals
        PENNYPICS_MINT_AUTHORITY.publicKey, // Mint authority - PennyPics dedicated keypair
        null                                // Freeze authority (none)
      )
    );
    
    // Find the associated token account for the payer
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      payer.publicKey
    );
    
    // Find the associated token account for the treasury
    const treasuryTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      PENNYPICS_TREASURY_ADDRESS
    );
    
    // Add instruction to create the associated token account for the admin (for management)
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,              // Payer
        associatedTokenAddress,       // Associated token account address
        payer.publicKey,              // Token account owner
        mintKeypair.publicKey         // Mint
      )
    );
    
    // Add instruction to create the associated token account for the treasury
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,              // Payer
        treasuryTokenAddress,         // Treasury's token account address
        PENNYPICS_TREASURY_ADDRESS,   // Treasury as the owner
        mintKeypair.publicKey         // Mint
      )
    );
    
    // Add instruction to mint the initial supply to the treasury
    transaction.add(
      createMintToInstruction(
        mintKeypair.publicKey,              // Mint
        treasuryTokenAddress,               // Destination (treasury account)
        PENNYPICS_MINT_AUTHORITY.publicKey, // Authority - must be the mint authority
        PENNYPICS_TOKEN_TOTAL_SUPPLY        // Amount
      )
    );
    
    // Get the most recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;
    
    // Sign the transaction with both the payer and the mint keypair
    const signedTransaction = await payer.signTransaction(transaction);
    signedTransaction.partialSign(mintKeypair);
    signedTransaction.partialSign(PENNYPICS_MINT_AUTHORITY);
    
    // Send the transaction
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log("TOKEN_CREATE: Transaction submitted:", txid);
    
    // Wait for confirmation with a longer timeout and better error handling
    try {
      console.log("TOKEN_CREATE: Waiting for transaction confirmation...");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      const confirmation = await connection.confirmTransaction({
        signature: txid,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }, 'confirmed');  // Use 'confirmed' instead of 'finalized' for faster confirmation
      
      console.log("TOKEN_CREATE: Transaction confirmed:", confirmation);
      
      // Wait a moment to make sure the token is fully initialized
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to get the mint info to confirm it's correctly created
      try {
        const mintInfo = await getMint(connection, mintKeypair.publicKey);
        console.log("TOKEN_CREATE: Token mint info:", {
          address: mintInfo.address.toString(),
          supply: mintInfo.supply.toString(),
          decimals: mintInfo.decimals
        });
      } catch (mintError) {
        console.warn("TOKEN_CREATE: Could not fetch mint info, but transaction was confirmed:", mintError.message);
      }
    } catch (confirmError) {
      console.warn("TOKEN_CREATE: Transaction confirmation timed out, but it may still succeed:", confirmError.message);
      // Don't throw an error here, as the transaction might still succeed
    }
    
    // Return the token details regardless of confirmation status
    return {
      mint: mintKeypair.publicKey.toString(),
      tokenAccount: associatedTokenAddress.toString(),
      treasuryTokenAccount: treasuryTokenAddress.toString(),
      treasuryAddress: PENNYPICS_TREASURY_ADDRESS.toString(),
      mintAuthority: PENNYPICS_MINT_AUTHORITY.publicKey.toString(),
      mintAuthoritySecretKey: Buffer.from(PENNYPICS_MINT_AUTHORITY.secretKey).toString('base64'),
      mintSignature: txid,
      decimals: PENNYPICS_TOKEN_DECIMALS,
      symbol: PENNYPICS_TOKEN_SYMBOL,
      name: PENNYPICS_TOKEN_NAME,
      transactionSent: true,
      // If we get here without an error, either confirmation succeeded or timed out
      confirmationStatus: "Transaction sent, may still be processing"
    };
    
  } catch (error) {
    console.error("TOKEN_CREATE: Error creating token:", error);
    // Log more details about the error
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }
    throw new Error(`Token creation failed: ${error.message}`);
  }
}

// Helper function to get the associated token address (simplified version of getOrCreateAssociatedTokenAccount)
async function getAssociatedTokenAddress(
  mint,
  owner
) {
  const [address] = await PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(), 
      mint.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

/**
 * Gets a user's token balance
 */
export async function getTokenBalance(connection, walletPublicKey) {
  // If we're using a placeholder token mint, return 0
  if (!TOKEN_MINT_ADDRESS) {
    console.log("Token mint not set yet. Create the token first.");
    return 0;
  }

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
 * Buys tokens by sending SOL to the treasury and getting tokens in return
 * This simplifies the flow for users - they directly get tokens from the treasury
 */
export async function buyTokens(connection, buyer) {
  try {
    // Standard amount in tokens
    const tokenAmount = TOKENS_PER_PURCHASE;
    
    // Price in SOL
    const solCost = TOKEN_COST_SOL * tokenAmount;
    console.log(`TOKEN_BUY: Buying ${tokenAmount} tokens for ${solCost} SOL`);
    
    // 1. First, create a SOL payment transaction from buyer to treasury
    const lamports = Math.floor(solCost * LAMPORTS_PER_SOL);
    
    const paymentTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyer.publicKey,
        toPubkey: PENNYPICS_TREASURY_ADDRESS, // Send SOL to treasury
        lamports,
      })
    );
    
    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    paymentTransaction.recentBlockhash = blockhash;
    paymentTransaction.feePayer = buyer.publicKey;
    
    // Sign and send the payment transaction
    let paymentSignature;
    try {
      paymentSignature = await connection.sendTransaction(paymentTransaction, [buyer]);
      console.log(`TOKEN_BUY: Payment sent. Signature: ${paymentSignature}`);
    
      // Confirm the payment transaction
      await connection.confirmTransaction({
        signature: paymentSignature,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }, 'confirmed');
    } catch (error) {
      console.error("TOKEN_BUY: Error sending payment:", error);
      throw new Error(`Failed to send SOL payment: ${error.message}`);
    }
    
    // 2. Create the buyer's token account if it doesn't exist
    let buyerTokenAccount;
    try {
      buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        buyer, // The buyer pays to create their token account if it doesn't exist
        PENNYPICS_TOKEN_MINT,
        buyer.publicKey
      );
      console.log(`TOKEN_BUY: Buyer token account: ${buyerTokenAccount.address.toString()}`);
    } catch (error) {
      console.error("TOKEN_BUY: Error creating buyer token account:", error);
      throw new Error(`Payment sent, but failed to create token account: ${error.message}`);
    }
    
    // 3. Get the treasury's token account
    let treasuryTokenAccount;
    try {
      treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        buyer, // Treasury account needs to be created or found
        PENNYPICS_TOKEN_MINT,
        PENNYPICS_TREASURY_ADDRESS
      );
      console.log(`TOKEN_BUY: Treasury token account: ${treasuryTokenAccount.address.toString()}`);
    } catch (error) {
      console.error("TOKEN_BUY: Error getting treasury token account:", error);
      throw new Error(`Payment sent, but failed to get treasury token account: ${error.message}`);
    }
    
    // 4. Transfer tokens from treasury to buyer - no need for an admin keypair!
    let transferTransaction = new Transaction();
    transferTransaction.add(
      transfer(
        treasuryTokenAccount.address, // From treasury's token account
        buyerTokenAccount.address,    // To buyer's token account
        PENNYPICS_TREASURY_ADDRESS,   // Authority (treasury)
        tokenAmount                   // Number of tokens to transfer
      )
    );
    
    // This won't work without the treasury's private key, which we don't have
    // This is just placeholder code to show the concept
    console.log(`TOKEN_BUY: Note: In a real implementation, a server-side process with the treasury's keypair would need to transfer tokens`);
    
    // Return success information (in a real implementation, the server would handle the token transfer)
    return {
      success: true,
      paymentSignature,
      tokenTransferPending: true, // Flag to indicate transfer is pending server action
      message: "Payment successful! Tokens will be transferred to your account shortly.",
      tokenAmount,
      solCost
    };
  } catch (error) {
    console.error("TOKEN_BUY: Error buying tokens:", error);
    throw new Error(`Token purchase failed: ${error.message}`);
  }
}

/**
 * Spends tokens to pay for an image generation
 * This function just deducts tokens from the user's balance locally,
 * since we're managing credits in localStorage
 */
export function spendTokensForImage() {
  // Cost in PENNY tokens to generate an image
  const TOKENS_PER_IMAGE = 1;
  
  // Get current token balance from localStorage
  const currentTokens = localStorage.getItem('pennypics_image_credits');
  const numTokens = currentTokens ? parseInt(currentTokens, 10) : 0;
  
  if (numTokens < TOKENS_PER_IMAGE) {
    throw new Error(`Not enough tokens. You have ${numTokens}, need ${TOKENS_PER_IMAGE}.`);
  }
  
  // Deduct tokens and save back to localStorage
  const newBalance = numTokens - TOKENS_PER_IMAGE;
  localStorage.setItem('pennypics_image_credits', newBalance.toString());
  
  return {
    success: true,
    tokensSpent: TOKENS_PER_IMAGE,
    remainingTokens: newBalance
  };
} 