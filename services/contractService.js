/**
 * CampusTrust AI - Contract Service
 * =====================================
 * High-level service for interacting with CampusTrust smart contracts.
 * Wraps algorandService with contract-specific logic.
 */

import {
  callApp,
  optInToApp,
  readGlobalState,
  readLocalState,
  createASA,
  sha256Hash,
  getExplorerUrl,
} from './algorandService.js';

// ═══════════════════════════════════════════════════════════
// CONTRACT APP IDs (loaded from deployment or set manually)
// ═══════════════════════════════════════════════════════════

let contractIds = {
  voting: null,
  credential: null,
  feedback: null,
  attendance: null,
};

/**
 * Set contract IDs from deployment
 */
export function setContractIds(ids) {
  contractIds = { ...contractIds, ...ids };
}

/**
 * Get current contract IDs
 */
export function getContractIds() {
  return { ...contractIds };
}

/**
 * Load contract IDs from deployment file
 */
export async function loadDeployment() {
  try {
    const resp = await fetch('/algorand-testnet-deployment.json');
    if (resp.ok) {
      const data = await resp.json();
      if (data.contracts) {
        contractIds.voting = data.contracts.voting?.app_id || null;
        contractIds.credential = data.contracts.credential?.app_id || null;
        contractIds.feedback = data.contracts.feedback?.app_id || null;
        contractIds.attendance = data.contracts.attendance?.app_id || null;
      }
      return contractIds;
    }
  } catch (e) {
    console.log('No deployment file found, using manual IDs');
  }
  return contractIds;
}

// ═══════════════════════════════════════════════════════════
// VOTING CONTRACT
// ═══════════════════════════════════════════════════════════

export const voting = {
  /**
   * Register as a voter (opt-in)
   */
  async register(userAddress, signCallback, customAppId = null) {
    const appId = customAppId || contractIds.voting;
    if (!appId) throw new Error('Voting contract not deployed');
    return await optInToApp(userAddress, appId, signCallback);
  },

  /**
   * Cast a vote for a proposal
   */
  async vote(userAddress, proposalIndex, signCallback, customAppId = null) {
    const appId = customAppId || contractIds.voting;
    if (!appId) throw new Error('Voting contract not deployed');
    return await callApp(
      userAddress,
      appId,
      ['vote', proposalIndex],
      [],
      signCallback
    );
  },

  /**
   * Finalize election results (admin only)
   */
  async finalize(adminAddress, signCallback) {
    if (!contractIds.voting) throw new Error('Voting contract not deployed');
    return await callApp(
      adminAddress,
      contractIds.voting,
      ['finalize'],
      [],
      signCallback
    );
  },

  /**
   * Get election state
   */
  async getState(customAppId = null) {
    const appId = customAppId || contractIds.voting;
    if (!appId) return null;
    const state = await readGlobalState(appId);
    return {
      electionName: state.election_name || '',
      numProposals: state.num_proposals || 0,
      startTime: state.start_time || 0,
      endTime: state.end_time || 0,
      totalVotes: state.total_votes || 0,
      isFinalized: state.is_finalized || 0,
      proposals: [
        { name: state.proposal_0_name || 'Proposal A', votes: state.proposal_0_votes || 0 },
        { name: state.proposal_1_name || 'Proposal B', votes: state.proposal_1_votes || 0 },
        { name: state.proposal_2_name || 'Proposal C', votes: state.proposal_2_votes || 0 },
        { name: state.proposal_3_name || 'Proposal D', votes: state.proposal_3_votes || 0 },
      ].slice(0, state.num_proposals || 2),
      explorerUrl: getExplorerUrl('application', appId),
    };
  },

  /**
   * Get voter's local state
   */
  async getVoterState(address) {
    if (!contractIds.voting) return null;
    return await readLocalState(address, contractIds.voting);
  },
};

// ═══════════════════════════════════════════════════════════
// CREDENTIAL CONTRACT
// ═══════════════════════════════════════════════════════════

export const credential = {
  /**
   * Register as credential holder (opt-in)
   */
  async register(userAddress, signCallback) {
    if (!contractIds.credential) throw new Error('Credential contract not deployed');
    return await optInToApp(userAddress, contractIds.credential, signCallback);
  },

  /**
   * Issue a credential to a student (admin only)
   */
  async issue(adminAddress, studentAddress, credentialData, aiScore, signCallback) {
    if (!contractIds.credential) throw new Error('Credential contract not deployed');
    const hash = await sha256Hash(JSON.stringify(credentialData));
    return await callApp(
      adminAddress,
      contractIds.credential,
      ['issue', hash, credentialData.type || 'certificate', aiScore],
      [studentAddress],
      signCallback
    );
  },

  /**
   * Revoke a credential (admin only)
   */
  async revoke(adminAddress, studentAddress, signCallback) {
    if (!contractIds.credential) throw new Error('Credential contract not deployed');
    return await callApp(
      adminAddress,
      contractIds.credential,
      ['revoke'],
      [studentAddress],
      signCallback
    );
  },

  /**
   * Get credential state
   */
  async getState() {
    if (!contractIds.credential) return null;
    const state = await readGlobalState(contractIds.credential);
    return {
      institutionName: state.institution_name || '',
      totalIssued: state.total_issued || 0,
      totalRevoked: state.total_revoked || 0,
      explorerUrl: getExplorerUrl('application', contractIds.credential),
    };
  },

  /**
   * Get holder's credential state
   */
  async getHolderState(address) {
    if (!contractIds.credential) return null;
    return await readLocalState(address, contractIds.credential);
  },

  /**
   * Create a credential as an Algorand Standard Asset (NFT)
   */
  async createCredentialASA(adminAddress, credentialData, signCallback) {
    return await createASA(
      adminAddress,
      {
        total: 1,
        decimals: 0,
        unitName: 'CRED',
        assetName: `CT-${credentialData.recipientName}-${credentialData.type}`,
        url: credentialData.ipfsUrl || '',
      },
      signCallback
    );
  },
};

// ═══════════════════════════════════════════════════════════
// FEEDBACK CONTRACT
// ═══════════════════════════════════════════════════════════

export const feedback = {
  /**
   * Register for feedback (opt-in)
   */
  async register(userAddress, signCallback) {
    if (!contractIds.feedback) throw new Error('Feedback contract not deployed');
    return await optInToApp(userAddress, contractIds.feedback, signCallback);
  },

  /**
   * Submit feedback with AI sentiment analysis
   */
  async submit(userAddress, feedbackText, sentimentScore, category, signCallback) {
    if (!contractIds.feedback) throw new Error('Feedback contract not deployed');
    const hash = await sha256Hash(feedbackText);
    return await callApp(
      userAddress,
      contractIds.feedback,
      ['submit', hash, sentimentScore, category],
      [],
      signCallback
    );
  },

  /**
   * Close feedback collection (admin only)
   */
  async close(adminAddress, signCallback) {
    if (!contractIds.feedback) throw new Error('Feedback contract not deployed');
    return await callApp(
      adminAddress,
      contractIds.feedback,
      ['close'],
      [],
      signCallback
    );
  },

  /**
   * Get feedback session state
   */
  async getState() {
    if (!contractIds.feedback) return null;
    const state = await readGlobalState(contractIds.feedback);
    return {
      topic: state.topic || '',
      totalFeedback: state.total_feedback || 0,
      avgSentiment: state.avg_sentiment || 50,
      positiveCount: state.positive_count || 0,
      negativeCount: state.negative_count || 0,
      neutralCount: state.neutral_count || 0,
      isActive: state.is_active || 0,
      explorerUrl: getExplorerUrl('application', contractIds.feedback),
    };
  },
};

// ═══════════════════════════════════════════════════════════
// ATTENDANCE CONTRACT
// ═══════════════════════════════════════════════════════════

export const attendance = {
  /**
   * Register student (opt-in)
   */
  async register(userAddress, signCallback) {
    if (!contractIds.attendance) throw new Error('Attendance contract not deployed');
    return await optInToApp(userAddress, contractIds.attendance, signCallback);
  },

  /**
   * Start new attendance session (admin only)
   */
  async startSession(adminAddress, durationSeconds, signCallback) {
    if (!contractIds.attendance) throw new Error('Attendance contract not deployed');
    return await callApp(
      adminAddress,
      contractIds.attendance,
      ['start_session', durationSeconds],
      [],
      signCallback
    );
  },

  /**
   * Check in to current session
   */
  async checkIn(userAddress, signCallback) {
    if (!contractIds.attendance) throw new Error('Attendance contract not deployed');
    return await callApp(
      userAddress,
      contractIds.attendance,
      ['checkin'],
      [],
      signCallback
    );
  },

  /**
   * End current session (admin only)
   */
  async endSession(adminAddress, signCallback) {
    if (!contractIds.attendance) throw new Error('Attendance contract not deployed');
    return await callApp(
      adminAddress,
      contractIds.attendance,
      ['end_session'],
      [],
      signCallback
    );
  },

  /**
   * Flag attendance anomaly (admin only, AI-driven)
   */
  async flagAnomaly(adminAddress, studentAddress, flagValue, signCallback) {
    if (!contractIds.attendance) throw new Error('Attendance contract not deployed');
    return await callApp(
      adminAddress,
      contractIds.attendance,
      ['flag_anomaly', flagValue],
      [studentAddress],
      signCallback
    );
  },

  /**
   * Get attendance system state
   */
  async getState() {
    if (!contractIds.attendance) return null;
    const state = await readGlobalState(contractIds.attendance);
    return {
      courseName: state.course_name || '',
      sessionId: state.session_id || 0,
      sessionActive: state.session_active || 0,
      sessionStart: state.session_start || 0,
      sessionEnd: state.session_end || 0,
      totalSessions: state.total_sessions || 0,
      totalCheckins: state.total_checkins || 0,
      explorerUrl: getExplorerUrl('application', contractIds.attendance),
    };
  },

  /**
   * Get student's attendance state
   */
  async getStudentState(address) {
    if (!contractIds.attendance) return null;
    return await readLocalState(address, contractIds.attendance);
  },
};
