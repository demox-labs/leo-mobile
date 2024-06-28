export * from './types';

import { LeoWindowObject } from "./leo-wallet-window-object";

// Create a reference to your wallet's existing API.
const leoWallet = new LeoWindowObject();

// Attach the reference to the window, guarding against errors.
try {
  Object.defineProperty(window, 'leoWallet', { value: leoWallet, writable: true });
} catch (error) {
  console.error(error);
}