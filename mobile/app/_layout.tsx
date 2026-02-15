// MUST be first import — polyfills crypto.getRandomValues for algosdk
import '../polyfills';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WalletProvider } from '@/hooks/useWallet';

export default function RootLayout() {
    return (
        <WalletProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#101e22' } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
        </WalletProvider>
    );
} 
