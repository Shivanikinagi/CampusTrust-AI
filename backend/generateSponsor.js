/**
 * Generate Sponsor Account for Gasless Transactions
 * ===================================================
 * Creates a new Algorand account to act as fee sponsor
 * This account will pay transaction fees for all users
 */

import algosdk from 'algosdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate new account
const account = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

console.log('\n🎉 New Sponsor Account Generated!');
console.log('==================================\n');
console.log('📍 Address:', account.addr);
console.log('🔑 Mnemonic:', mnemonic);
console.log('\n⚠️  IMPORTANT: Fund this account with ALGO on TestNet!');
console.log('💰 Recommended: 10-50 ALGO for testing');
console.log('🌐 Get TestNet ALGO: https://bank.testnet.algorand.network/');
console.log('\n📋 Next Steps:');
console.log('1. Copy the mnemonic above');
console.log('2. Add to your .env file as SPONSOR_MNEMONIC="..."');
console.log('3. Fund the address with TestNet ALGO');
console.log('4. Restart the backend server\n');

// Optionally append to .env file
const envPath = path.join(__dirname, '..', '.env');
const envLine = `\n# Sponsor Account for Gasless Transactions\nSPONSOR_MNEMONIC="${mnemonic}"\nSPONSOR_ADDRESS=${account.addr}\n`;

console.log('📝 Would you like to automatically add this to .env? (Manual recommended)');
console.log('\nTo add manually, append to .env:');
console.log(envLine);

// Uncomment to auto-append (not recommended for security)
// fs.appendFileSync(envPath, envLine);
// console.log('✅ Added to .env file!\n');
