# UI and Real-Time Data Updates

## Summary
Fixed visibility issues with dark text on dark backgrounds and converted static mock data to real-time blockchain queries.

## Changes Made

### 1. BadgeGallery Component (`components/BadgeGallery.jsx`)

#### Visibility Fixes:
- **NFT Info Section**: Changed `bg-gradient-to-r from-gray-50 to-gray-100` → `bg-gray-800`
- **Text Colors**: Updated `text-gray-600` → `text-white/text-gray-400` for better contrast
- **Tips Section**: Changed `bg-white` → `bg-gray-800`, `text-gray-700` → `text-gray-200`
- **Connect Wallet Message**: Updated `text-gray-600` → `text-gray-300`
- **Modal "How to Earn"**: Changed `bg-gray-50` → `bg-gray-700`, updated text colors

#### Real-Time Data Integration:
- **Added Import**: `readLocalState` from `contractService`
- **Modified `loadBadges()` Function**: 
  - Now reads from badge contract using `VITE_BADGE_APP_ID`
  - Calls `readLocalState(badgeAppId, walletAddress)` to get user's badges
  - Decodes `badges_earned` bitfield (bits 0-7) to determine earned badges
  - Replaces hardcoded `[0, 1, 3, 6]` with actual blockchain data

### 2. TokenRewards Component (`components/TokenRewards.jsx`)

#### Visibility Fixes:
- **Opt-in Screen**: Changed `bg-gradient-to-br from-blue-50 to-indigo-50` → `bg-gray-800`
- **Text Colors**: Updated multiple instances of `text-gray-600/500` → `text-gray-300/400`
- **Earn More Tokens Card**: Changed `bg-white` → `bg-gray-800`
- **Leaderboard Card**: Changed `bg-white` → `bg-gray-800`
- **Leaderboard Items**: Changed `bg-gray-50` → `bg-gray-700`, `bg-blue-50` → `bg-blue-900`
- **Token Amount Cards**: Updated border colors from `border-gray-200` → `border-gray-600`
- **Algorand Info Section**: Changed `bg-gradient-to-r from-gray-50 to-gray-100` → `bg-gray-800`

#### Real-Time Data Integration:
- **Added Import**: `readLocalState` from `contractService`
- **Added State**: `participationStats` to track votes, attendance, feedback counts
- **Modified `loadTokenData()` Function**:
  - Reads from token contract using `VITE_TOKEN_APP_ID`
  - Calls `readLocalState(tokenAppId, walletAddress)` to get user's token data
  - Extracts `tokens_earned`, `participation_count` from contract state
  - Calculates estimated participation breakdown (votes, attendance, feedback)
  - Updates participation stats display with real data
- **Removed Mock Data**:
  - Removed mock reward history (requires Algorand Indexer integration)
  - Simplified leaderboard to show only current user (full leaderboard requires indexer)

## Smart Contract Integration

### Badge Contract (App ID: 755501428)
- **Local State Variables Read**:
  - `badges_earned`: Integer bitfield where each bit (0-7) represents a badge type

### Token Contract (App ID: 755501409)
- **Local State Variables Read**:
  - `tokens_earned`: Total tokens user has earned
  - `participation_count`: Number of participation actions
  - `voting_reward`: Tokens earned per vote (default: 10)
  - `attendance_reward`: Tokens earned per attendance (default: 5)
  - `feedback_reward`: Tokens earned per feedback (default: 3)

## Benefits

1. **Better Visibility**: All text is now readable on dark backgrounds with proper contrast
2. **Real-Time Data**: Components now show actual blockchain state instead of mock data
3. **Production Ready**: Application displays real user progress and tokens from deployed contracts
4. **Hackathon Ready**: Demonstrates actual Algorand blockchain integration with live data queries

## Technical Notes

- Both components use `readLocalState()` to query smart contract state
- Bitfield decoding used for efficient badge storage (8 badges in 1 integer)
- Error handling for users who haven't opted into contracts
- Participation stats are estimated based on default reward values
- Full transaction history requires Algorand Indexer (not yet implemented)
