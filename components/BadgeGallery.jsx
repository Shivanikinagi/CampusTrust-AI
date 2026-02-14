/**
 * CampusTrust AI - Badge Gallery Component
 * ==========================================
 * Displays NFT achievement badges earned by students.
 * 
 * Features:
 * - ARC-3/ARC-19 compliant NFT badges
 * - 8 unique achievement types
 * - Progress tracking toward legendary badge
 * - IPFS metadata integration
 * - Badge showcase with animations
 * 
 * Showcases Algorand NFT capabilities
 */

import { useState, useEffect } from 'react';
import { getOwnedAssets, getAssetInfo } from '../services/assetService';
import { Award, Star, Trophy, Zap, Users, MessageSquare, CheckCircle, Crown } from 'lucide-react';

const BADGE_TYPES = [
  {
    id: 0,
    name: 'Perfect Attendance',
    icon: CheckCircle,
    color: 'from-green-400 to-emerald-600',
    description: '100% attendance record',
    criteria: 'Attend all campus events in a semester',
  },
  {
    id: 1,
    name: 'Governance Champion',
    icon: Trophy,
    color: 'from-blue-400 to-blue-600',
    description: 'Most active voter',
    criteria: 'Vote on 50+ proposals',
  },
  {
    id: 2,
    name: 'Feedback Hero',
    icon: MessageSquare,
    color: 'from-purple-400 to-purple-600',
    description: 'Top feedback contributor',
    criteria: 'Submit 100+ feedback entries',
  },
  {
    id: 3,
    name: 'Early Adopter',
    icon: Zap,
    color: 'from-yellow-400 to-orange-500',
    description: 'First 100 platform users',
    criteria: 'Join in the first week',
  },
  {
    id: 4,
    name: 'Community Builder',
    icon: Users,
    color: 'from-pink-400 to-rose-600',
    description: 'Engaged community member',
    criteria: 'Help onboard 10 new users',
  },
  {
    id: 5,
    name: 'Proposal Creator',
    icon: Star,
    color: 'from-indigo-400 to-indigo-600',
    description: 'Created impactful proposals',
    criteria: 'Create 5 approved proposals',
  },
  {
    id: 6,
    name: 'Token Holder',
    icon: Award,
    color: 'from-teal-400 to-cyan-600',
    description: 'Accumulated significant tokens',
    criteria: 'Earn 500+ CGT tokens',
  },
  {
    id: 7,
    name: 'Legendary Contributor',
    icon: Crown,
    color: 'from-amber-400 to-yellow-600',
    description: 'Ultimate achievement',
    criteria: 'Earn all 7 badges',
    legendary: true,
  },
];

const BadgeGallery = ({ walletAddress, badgeAssetIds = [] }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      loadBadges();
    }
  }, [walletAddress]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      
      // Get all owned assets
      const assets = await getOwnedAssets(walletAddress);
      
      // Filter for badge NFTs (mock - in production, check against badgeAssetIds)
      const badgeAssets = assets.filter(asset => 
        asset['asset-id'] && badgeAssetIds.includes(asset['asset-id'])
      );
      
      // Mock earned badges for demo
      setEarnedBadges([0, 1, 3, 6]); // Has 4 out of 8 badges
      
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStatus = (badgeId) => {
    return earnedBadges.includes(badgeId);
  };

  const getProgressPercentage = () => {
    const regularBadges = BADGE_TYPES.filter(b => !b.legendary).length;
    const earnedRegular = earnedBadges.filter(id => id !== 7).length;
    return Math.round((earnedRegular / regularBadges) * 100);
  };

  if (!walletAddress) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Connect your wallet to view your achievement badges</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progress = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Achievement Badges</h2>
            <p className="text-purple-200">Collect NFT badges for your contributions</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <Trophy className="w-12 h-12" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-200">Overall Progress</span>
            <span className="text-sm font-bold">{earnedBadges.length}/8 Badges</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${(earnedBadges.length / 8) * 100}%` }}
            >
              {earnedBadges.length > 0 && (
                <span className="text-xs font-bold text-white">{Math.round((earnedBadges.length / 8) * 100)}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BADGE_TYPES.map((badge) => {
          const earned = getBadgeStatus(badge.id);
          const Icon = badge.icon;
          
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                earned
                  ? `bg-gradient-to-br ${badge.color} text-white shadow-lg hover:shadow-2xl hover:scale-105`
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              } ${badge.legendary ? 'ring-4 ring-yellow-500 ring-opacity-50' : ''}`}
            >
              {/* Legendary Sparkle Effect */}
              {badge.legendary && earned && (
                <div className="absolute -top-2 -right-2">
                  <Star className="w-8 h-8 text-yellow-300 animate-pulse" fill="currentColor" />
                </div>
              )}
              
              {/* Lock Icon for Unearned */}
              {!earned && (
                <div className="absolute top-4 right-4 opacity-30">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Badge Icon */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                earned ? 'bg-white/20' : 'bg-gray-300'
              }`}>
                <Icon className={`w-8 h-8 ${earned ? 'text-white' : 'text-gray-500'}`} />
              </div>
              
              {/* Badge Name */}
              <h3 className={`text-center font-bold mb-2 ${earned ? 'text-white' : 'text-gray-500'}`}>
                {badge.name}
              </h3>
              
              {/* Badge Description */}
              <p className={`text-center text-sm ${earned ? 'text-white/80' : 'text-gray-400'}`}>
                {badge.description}
              </p>
              
              {/* NFT Indicator */}
              {earned && (
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    NFT Owned
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${selectedBadge.color} flex items-center justify-center`}>
              <selectedBadge.icon className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">{selectedBadge.name}</h2>
            <p className="text-gray-600 text-center mb-6">{selectedBadge.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-sm text-gray-700">How to Earn</h3>
              <p className="text-sm text-gray-600">{selectedBadge.criteria}</p>
            </div>
            
            {getBadgeStatus(selectedBadge.id) ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">You own this badge!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">NFT stored on Algorand blockchain</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700">🎯 Keep contributing to unlock this badge</p>
              </div>
            )}
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Algorand NFT Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Powered by Algorand NFTs
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Standard</p>
            <p className="font-semibold">ARC-3 / ARC-19</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Storage</p>
            <p className="font-semibold">IPFS Metadata</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Transferable</p>
            <p className="font-semibold">Non-transferable (Frozen)</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🌱 All NFT transactions are carbon-negative on Algorand's Pure Proof-of-Stake network
          </p>
        </div>
      </div>

      {/* Tips for Earning More */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">🎯 Quick Tips to Earn More Badges</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span className="text-gray-700">Vote on every proposal to work toward Governance Champion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span className="text-gray-700">Submit detailed feedback to unlock Feedback Hero</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span className="text-gray-700">Invite friends to earn Community Builder badge</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span className="text-gray-700">Earn all 7 badges to unlock the legendary badge!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BadgeGallery;
