# PennyPics Troubleshooting Guide

This document provides solutions for common issues you might encounter when running the PennyPics application.

## Environment Setup Issues

### Stability API Key Issues

If you see errors like `Incorrect API key provided` or `Stability API error`, check the following:

1. Ensure your `.env.local` file has the correct API key format:
   ```
   STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
2. Verify the API key is correct and active by checking your Stability AI dashboard

3. Note that Stability API keys must start with `sk-`, not `k-`

4. If the key format is correct but you still see errors, try creating a new API key in your Stability AI dashboard

### Payment Issues

#### "Development mode: Payment skipped" Message

This is not an error, but a notification that you're running in development mode with payments disabled. To change this behavior:

1. Set `NEXT_PUBLIC_SKIP_PAYMENT=false` in your `.env.local` file to enable real payments

#### Solana Connection Issues

If you have problems connecting to Solana:

1. Make sure you're using the correct RPC URL for your environment:
   - Development/Testing: `https://api.devnet.solana.com`
   - Production: `https://api.mainnet-beta.solana.com`

2. Ensure your Phantom wallet is connected to the same network (Devnet or Mainnet)

3. If testing on Devnet, make sure you have Devnet SOL in your wallet (use Solana faucets)

## React Hydration Errors

If you see hydration errors in the console related to wallet connection or dark mode:

1. Check that all components that use browser-only APIs (like localStorage or wallet connection) are properly protected with:
   ```jsx
   const [mounted, setMounted] = useState(false);
   
   useEffect(() => {
     setMounted(true);
   }, []);
   
   if (!mounted) return null; // or a suitable loading placeholder
   ```

2. Ensure wallet components are imported with `dynamic` to prevent SSR issues:
   ```jsx
   import dynamic from 'next/dynamic';
   
   const WalletComponent = dynamic(() => import('./WalletComponent'), { ssr: false });
   ```

## Image Generation Issues

If images are not generating correctly:

1. Check the browser console for any API errors

2. Verify that your prompt is not empty and contains valid text

3. If using custom dimensions, ensure they're within the supported range (512-1536px)

4. Check that the selected style preset is supported by the API

## Deployment Issues

### Vercel Deployment

If your app fails to deploy on Vercel:

1. Make sure all environment variables are properly set in the Vercel project settings

2. Check build logs for any compilation errors

3. Verify that your Vercel account has access to the required domains and services

## Getting Help

If you continue to experience issues:

1. Check the GitHub issues for similar problems and solutions

2. Contact support at support@pennypics.com with detailed information about your issue

3. Join our Discord community for real-time assistance 