"""
CampusTrust AI - NLP Processor
=================================
Natural Language Processing utilities for text analysis,
key phrase extraction, and content summarization.

Features:
- Text preprocessing and cleaning
- Key phrase extraction
- Text similarity computation
- Content summarization
- Proposal quality scoring for voting system
- Credential description analysis
"""

import re
import math
from collections import Counter


class NLPProcessor:
    """Natural Language Processing utilities for campus governance."""

    # Common stop words
    STOP_WORDS = set([
        "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "can", "shall", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "as", "into", "through", "during",
        "before", "after", "above", "below", "between", "out", "off", "over",
        "under", "again", "further", "then", "once", "and", "but", "or",
        "nor", "not", "no", "so", "if", "it", "its", "this", "that", "these",
        "those", "i", "me", "my", "we", "our", "you", "your", "he", "she",
        "they", "them", "their", "what", "which", "who", "whom", "how",
        "all", "each", "every", "both", "few", "more", "most", "other",
        "some", "such", "only", "own", "same", "than", "too", "very",
    ])

    def preprocess(self, text):
        """Clean and preprocess text."""
        if not text:
            return ""
        text = text.lower().strip()
        text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def tokenize(self, text):
        """Tokenize text into words."""
        cleaned = self.preprocess(text)
        return [w for w in cleaned.split() if w not in self.STOP_WORDS and len(w) > 2]

    def extract_key_phrases(self, text, top_n=5):
        """Extract key phrases from text using TF scoring."""
        tokens = self.tokenize(text)
        if not tokens:
            return []

        # Bigrams and trigrams
        bigrams = [f"{tokens[i]} {tokens[i+1]}" for i in range(len(tokens)-1)]
        trigrams = [f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}" for i in range(len(tokens)-2)]

        # Frequency-based scoring
        freq = Counter(tokens + bigrams)
        top_phrases = freq.most_common(top_n)
        return [{"phrase": p, "score": round(s / max(len(tokens), 1), 3)} for p, s in top_phrases]

    def compute_similarity(self, text1, text2):
        """Compute cosine similarity between two texts."""
        tokens1 = Counter(self.tokenize(text1))
        tokens2 = Counter(self.tokenize(text2))

        if not tokens1 or not tokens2:
            return 0.0

        # All unique words
        all_words = set(tokens1.keys()) | set(tokens2.keys())

        # Dot product
        dot_product = sum(tokens1.get(w, 0) * tokens2.get(w, 0) for w in all_words)

        # Magnitudes
        mag1 = math.sqrt(sum(v ** 2 for v in tokens1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in tokens2.values()))

        if mag1 == 0 or mag2 == 0:
            return 0.0

        return round(dot_product / (mag1 * mag2), 4)

    def summarize(self, text, max_sentences=3):
        """Extract key sentences as a summary."""
        sentences = re.split(r"[.!?]+", text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

        if len(sentences) <= max_sentences:
            return ". ".join(sentences) + "."

        # Score sentences by keyword importance
        all_tokens = self.tokenize(text)
        word_freq = Counter(all_tokens)

        scored = []
        for i, sent in enumerate(sentences):
            tokens = self.tokenize(sent)
            score = sum(word_freq.get(t, 0) for t in tokens) / max(len(tokens), 1)
            # Position bonus (first and last sentences)
            if i == 0:
                score *= 1.5
            elif i == len(sentences) - 1:
                score *= 1.2
            scored.append((score, i, sent))

        # Top sentences in original order
        scored.sort(reverse=True)
        top = sorted(scored[:max_sentences], key=lambda x: x[1])

        return ". ".join(s[2] for s in top) + "."

    def score_proposal_quality(self, proposal_text):
        """
        Score the quality of a voting proposal for the governance system.
        
        Evaluates: clarity, specificity, feasibility, and completeness.
        Returns score 0-100 and detailed breakdown.
        """
        if not proposal_text or len(proposal_text.strip()) < 10:
            return {
                "overall_score": 0,
                "breakdown": {},
                "suggestions": ["Proposal text is too short. Please provide more details."],
            }

        text = proposal_text.strip()
        words = text.split()
        tokens = self.tokenize(text)

        scores = {}
        suggestions = []

        # 1. Length/Completeness (0-25)
        word_count = len(words)
        if word_count >= 100:
            scores["completeness"] = 25
        elif word_count >= 50:
            scores["completeness"] = 20
        elif word_count >= 20:
            scores["completeness"] = 15
        else:
            scores["completeness"] = max(5, word_count)
            suggestions.append("Consider adding more detail to your proposal (aim for 50+ words).")

        # 2. Clarity (0-25) - sentence structure
        sentences = re.split(r"[.!?]+", text)
        sentences = [s.strip() for s in sentences if s.strip()]
        avg_sentence_len = len(words) / max(len(sentences), 1)

        if 10 <= avg_sentence_len <= 25:
            scores["clarity"] = 25
        elif avg_sentence_len < 10:
            scores["clarity"] = 15
            suggestions.append("Sentences are very short. Consider expanding your points.")
        else:
            scores["clarity"] = 15
            suggestions.append("Some sentences are quite long. Consider breaking them up.")

        # 3. Specificity (0-25) - presence of concrete details
        specificity_indicators = [
            "budget", "cost", "timeline", "deadline", "students", "department",
            "implement", "solution", "improve", "increase", "decrease", "reduce",
            "measure", "track", "percent", "number", "data", "result",
        ]
        specificity_count = sum(1 for ind in specificity_indicators if ind in text.lower())
        scores["specificity"] = min(25, specificity_count * 5 + 5)
        if specificity_count < 2:
            suggestions.append("Add specific details like timelines, budgets, or measurable goals.")

        # 4. Feasibility indicators (0-25)
        feasibility_indicators = [
            "step", "plan", "phase", "approach", "method", "resource",
            "team", "responsibility", "schedule", "milestone",
        ]
        feasibility_count = sum(1 for f in feasibility_indicators if f in text.lower())
        scores["feasibility"] = min(25, feasibility_count * 5 + 5)
        if feasibility_count < 2:
            suggestions.append("Include implementation steps or a basic plan.")

        overall = sum(scores.values())

        return {
            "overall_score": overall,
            "breakdown": scores,
            "suggestions": suggestions if suggestions else ["Proposal looks well-structured!"],
            "key_phrases": self.extract_key_phrases(text, 5),
            "word_count": word_count,
            "sentence_count": len(sentences),
        }

    def analyze_credential_description(self, description):
        """Analyze credential/certificate description for completeness."""
        required_elements = {
            "recipient": ["awarded to", "presented to", "granted to", "recipient", "student"],
            "achievement": ["completed", "achieved", "demonstrated", "passed", "earned"],
            "institution": ["university", "institute", "college", "school", "academy"],
            "date": ["date", "year", "semester", "term", "session"],
        }

        found = {}
        missing = []

        for element, keywords in required_elements.items():
            if any(kw in description.lower() for kw in keywords):
                found[element] = True
            else:
                found[element] = False
                missing.append(element)

        completeness = len([v for v in found.values() if v]) / len(found) * 100

        return {
            "completeness_score": round(completeness),
            "found_elements": {k: v for k, v in found.items() if v},
            "missing_elements": missing,
            "suggestions": [
                f"Consider adding {elem} information" for elem in missing
            ],
        }


if __name__ == "__main__":
    nlp = NLPProcessor()

    print("📝 CampusTrust AI - NLP Processor Demo\n")

    # Proposal scoring
    proposal = """
    We propose to implement a decentralized student ID verification system on campus.
    The solution will use Algorand blockchain to issue tamper-proof digital IDs.
    Timeline: Phase 1 (2 weeks) - Smart contract development. Phase 2 (1 week) - 
    Frontend integration. Budget: Minimal, using testnet ALGO. The team of 4 students
    will handle development. We measure success by tracking the number of verified IDs
    and reduction in manual verification time.
    """

    result = nlp.score_proposal_quality(proposal)
    print(f"📋 Proposal Score: {result['overall_score']}/100")
    for k, v in result["breakdown"].items():
        print(f"   {k}: {v}/25")
    for s in result["suggestions"]:
        print(f"   💡 {s}")
