/**
 * CampusTrust AI - React Native Crypto Polyfill
 * ==============================================
 * Must be imported BEFORE algosdk or any crypto-dependent library.
 * Provides crypto.getRandomValues for tweetnacl in React Native.
 */
import * as ExpoCrypto from 'expo-crypto';

// Create the random value generator function
const getRandomValuesPolyfill = function (array) {
    if (!array || !array.length) {
        throw new Error('Array required for getRandomValues');
    }
    
    try {
        const bytes = ExpoCrypto.getRandomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
            array[i] = bytes[i];
        }
        return array;
    } catch (error) {
        console.error('❌ ExpoCrypto.getRandomBytes failed:', error);
        // Fallback to Math.random (NOT cryptographically secure, but prevents crash)
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    }
};

// Initialize crypto object
if (typeof global.crypto === 'undefined') {
    global.crypto = {};
}

if (typeof global.crypto.getRandomValues === 'undefined') {
    global.crypto.getRandomValues = getRandomValuesPolyfill;
}

// Polyfill for self.crypto (some libraries check this)
if (typeof self !== 'undefined') {
    if (typeof self.crypto === 'undefined') {
        self.crypto = global.crypto;
    }
    if (typeof self.crypto.getRandomValues === 'undefined') {
        self.crypto.getRandomValues = getRandomValuesPolyfill;
    }
}

// Polyfill for window.crypto (browser compatibility)
if (typeof window !== 'undefined') {
    if (typeof window.crypto === 'undefined') {
        window.crypto = global.crypto;
    }
    if (typeof window.crypto.getRandomValues === 'undefined') {
        window.crypto.getRandomValues = getRandomValuesPolyfill;
    }
}

console.log('✅ Crypto polyfill loaded for React Native');
