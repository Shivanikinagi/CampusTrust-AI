/**
 * CampusTrust AI - Wallet Hook
 * ==============================
 * Global wallet state management for the mobile app.
 * Provides wallet address, account, balance.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as algorandService from '../services/algorandService';

interface WalletState {
    address: string | null;
    balance: number;
    isConnected: boolean;
    isLoading: boolean;
    account: any; // { address, sk, mnemonic }
}

interface WalletContextType extends WalletState {
    connectWallet: (mnemonic?: string) => Promise<void>;
    disconnectWallet: () => Promise<void>;
    refreshBalance: () => Promise<void>;
    generateNewWallet: () => { address: string; mnemonic: string };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<WalletState>({
        address: null,
        balance: 0,
        isConnected: false,
        isLoading: true,
        account: null,
    });

    // Load saved wallet on mount
    useEffect(() => {
        loadSavedWallet();
    }, []);

    const loadSavedWallet = async () => {
        try {
            const fullAccount = await algorandService.getFullAccount();
            if (fullAccount) {
                setState(prev => ({
                    ...prev,
                    address: fullAccount.address,
                    account: fullAccount,
                    isConnected: true,
                    isLoading: false,
                }));
                // Fetch balance in background
                fetchBalance(fullAccount.address);
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (e) {
            console.error('Failed to load saved wallet:', e);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const fetchBalance = async (address: string) => {
        try {
            const info = await algorandService.getAccountInfo(address);
            setState(prev => ({ ...prev, balance: info.balance }));
        } catch (e) {
            console.warn('Failed to fetch balance:', e);
        }
    };

    const connectWallet = useCallback(async (mnemonic?: string) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            let account;
            let walletMnemonic = mnemonic;

            if (mnemonic) {
                // Recover from mnemonic
                const recovered = algorandService.recoverAccount(mnemonic);
                account = { ...recovered, mnemonic };
            } else {
                // Generate new account
                const generated = algorandService.generateAccount();
                account = generated;
                walletMnemonic = generated.mnemonic;
            }

            // Save to secure store
            await algorandService.saveAccount(account.address, walletMnemonic!);

            setState({
                address: account.address,
                balance: 0,
                isConnected: true,
                isLoading: false,
                account: account,
            });

            // Fetch balance
            fetchBalance(account.address);
        } catch (e) {
            console.error('Failed to connect wallet:', e);
            setState(prev => ({ ...prev, isLoading: false }));
            throw e;
        }
    }, []);

    const disconnectWallet = useCallback(async () => {
        await algorandService.deleteSavedAccount();
        setState({
            address: null,
            balance: 0,
            isConnected: false,
            isLoading: false,
            account: null,
        });
    }, []);

    const refreshBalance = useCallback(async () => {
        if (state.address) {
            await fetchBalance(state.address);
        }
    }, [state.address]);

    const generateNewWallet = useCallback(() => {
        const account = algorandService.generateAccount();
        return { address: account.address, mnemonic: account.mnemonic };
    }, []);

    return (
        <WalletContext.Provider
            value={{
                ...state,
                connectWallet,
                disconnectWallet,
                refreshBalance,
                generateNewWallet,
            }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

export default useWallet;
