/**
 * CampusTrust AI - AI Service Client
 * =====================================
 * Frontend API client for the AI backend engine.
 * Handles all communication with the Flask AI server.
 */

const AI_BACKEND_URL = 'http://localhost:5001/api/ai';

// ═══════════════════════════════════════════════════════════
// HTTP HELPER
// ═══════════════════════════════════════════════════════════

async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${AI_BACKEND_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`AI API Error (${endpoint}):`, error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// SENTIMENT ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Analyze sentiment of a single feedback text
 */
export async function analyzeSentiment(text) {
  return apiCall('/sentiment', 'POST', { text });
}

/**
 * Analyze sentiment of multiple feedback texts
 */
export async function analyzeSentimentBatch(texts) {
  return apiCall('/sentiment/batch', 'POST', { texts });
}

// ═══════════════════════════════════════════════════════════
// ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════

/**
 * Detect anomalies in student attendance
 */
export async function detectAnomaly(studentData) {
  return apiCall('/anomaly', 'POST', studentData);
}

/**
 * Detect anomalies across entire class
 */
export async function detectClassAnomalies(studentsData) {
  return apiCall('/anomaly/class', 'POST', { students: studentsData });
}

// ═══════════════════════════════════════════════════════════
// NLP PROCESSING
// ═══════════════════════════════════════════════════════════

/**
 * Extract key phrases from text
 */
export async function extractKeyPhrases(text, topN = 5) {
  return apiCall('/nlp/keyphrases', 'POST', { text, top_n: topN });
}

/**
 * Compute similarity between two texts
 */
export async function computeSimilarity(text1, text2) {
  return apiCall('/nlp/similarity', 'POST', { text1, text2 });
}

/**
 * Summarize text
 */
export async function summarizeText(text, maxSentences = 3) {
  return apiCall('/nlp/summarize', 'POST', { text, max_sentences: maxSentences });
}

// ═══════════════════════════════════════════════════════════
// PROPOSAL SCORING
// ═══════════════════════════════════════════════════════════

/**
 * Score a voting proposal quality using AI
 */
export async function scoreProposal(text) {
  return apiCall('/proposal/score', 'POST', { text });
}

// ═══════════════════════════════════════════════════════════
// CREDENTIAL ANALYSIS
// ═══════════════════════════════════════════════════════════

/**
 * Analyze credential description completeness
 */
export async function analyzeCredential(description) {
  return apiCall('/credential/analyze', 'POST', { description });
}

// ═══════════════════════════════════════════════════════════
// AUTOMATION
// ═══════════════════════════════════════════════════════════

/**
 * Evaluate automation rules
 */
export async function evaluateAutomation(module, data) {
  return apiCall('/automation/evaluate', 'POST', { module, data });
}

/**
 * Get automation dashboard data
 */
export async function getAutomationDashboard() {
  return apiCall('/automation/dashboard');
}

// ═══════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════

/**
 * Generate hash for blockchain storage
 */
export async function generateHash(content) {
  return apiCall('/hash', 'POST', { content });
}

/**
 * Health check
 */
export async function checkAIHealth() {
  return apiCall('/health');
}

// ═══════════════════════════════════════════════════════════
// OFFLINE FALLBACK (when backend is not available)
// ═══════════════════════════════════════════════════════════

/**
 * Simple client-side sentiment analysis (fallback)
 */
export function analyzeSentimentOffline(text) {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'best', 'awesome', 'fantastic', 'helpful', 'perfect', 'brilliant'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'horrible', 'disappointed', 'frustrated', 'useless', 'waste', 'boring'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 50; // Neutral

  for (const word of words) {
    if (positiveWords.includes(word)) score += 8;
    if (negativeWords.includes(word)) score -= 8;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    sentiment_score: score,
    classification: score > 60 ? 'positive' : score < 40 ? 'negative' : 'neutral',
    confidence: Math.abs(score - 50) * 2,
    offline: true,
  };
}

/**
 * Simple client-side hash generation (fallback)
 */
export async function generateHashOffline(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
