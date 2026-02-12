"""
CampusTrust AI - Sentiment Analyzer
=====================================
AI-powered sentiment analysis for campus feedback.
Uses TextBlob NLP for real-time sentiment scoring and classification.

Features:
- Sentiment polarity scoring (0-100 scale)
- Emotion classification (positive/negative/neutral)
- Key phrase extraction
- Feedback category auto-detection
- Batch analysis support
"""

from textblob import TextBlob
import re
import json


class SentimentAnalyzer:
    """Analyze feedback text for sentiment, emotions, and key themes."""

    # Category keywords for auto-classification
    CATEGORY_KEYWORDS = {
        "teaching": ["teacher", "professor", "lecture", "teaching", "instructor", "explain", "class"],
        "infrastructure": ["lab", "library", "wifi", "internet", "building", "room", "facility", "equipment"],
        "curriculum": ["syllabus", "course", "subject", "content", "material", "curriculum", "topic"],
        "administration": ["admin", "office", "registration", "fees", "management", "staff"],
        "campus_life": ["event", "club", "sports", "canteen", "food", "hostel", "campus"],
        "examination": ["exam", "test", "marks", "grade", "evaluation", "result", "assessment"],
    }

    # Emotion indicators
    EMOTION_WORDS = {
        "joy": ["happy", "great", "excellent", "wonderful", "love", "amazing", "fantastic", "awesome"],
        "frustration": ["frustrated", "annoyed", "irritated", "angry", "upset", "terrible", "worst"],
        "satisfaction": ["satisfied", "good", "decent", "okay", "fine", "helpful", "useful"],
        "disappointment": ["disappointed", "poor", "bad", "lacking", "missing", "inadequate"],
        "enthusiasm": ["excited", "enthusiastic", "passionate", "motivated", "inspired", "eager"],
    }

    def analyze(self, text):
        """
        Perform comprehensive sentiment analysis on feedback text.
        
        Args:
            text: Feedback text string
            
        Returns:
            dict with sentiment_score (0-100), classification, emotions,
            key_phrases, category, and confidence
        """
        if not text or not text.strip():
            return self._empty_result()

        blob = TextBlob(text)

        # Polarity: -1 to 1 → mapped to 0-100
        polarity = blob.sentiment.polarity
        sentiment_score = int((polarity + 1) * 50)

        # Subjectivity: 0 (objective) to 1 (subjective)
        subjectivity = blob.sentiment.subjectivity

        # Classification
        if sentiment_score > 60:
            classification = "positive"
        elif sentiment_score < 40:
            classification = "negative"
        else:
            classification = "neutral"

        # Confidence based on subjectivity and polarity strength
        confidence = min(100, int(abs(polarity) * 100 + subjectivity * 20))

        # Detect emotions
        emotions = self._detect_emotions(text.lower())

        # Extract key phrases (noun phrases from TextBlob)
        key_phrases = list(set(blob.noun_phrases))[:5]

        # Auto-detect category
        category = self._detect_category(text.lower())

        # Sentence-level breakdown
        sentence_sentiments = []
        for sentence in blob.sentences:
            s_score = int((sentence.sentiment.polarity + 1) * 50)
            sentence_sentiments.append({
                "text": str(sentence),
                "score": s_score,
                "classification": "positive" if s_score > 60 else "negative" if s_score < 40 else "neutral",
            })

        return {
            "sentiment_score": sentiment_score,
            "classification": classification,
            "confidence": confidence,
            "subjectivity": round(subjectivity, 3),
            "emotions": emotions,
            "key_phrases": key_phrases,
            "category": category,
            "sentence_analysis": sentence_sentiments,
            "word_count": len(text.split()),
        }

    def analyze_batch(self, texts):
        """Analyze multiple feedback texts and return aggregate statistics."""
        results = [self.analyze(t) for t in texts]

        if not results:
            return {"results": [], "aggregate": {}}

        scores = [r["sentiment_score"] for r in results]
        categories = {}
        emotions_agg = {}

        for r in results:
            cat = r["category"]
            categories[cat] = categories.get(cat, 0) + 1
            for emo in r["emotions"]:
                emotions_agg[emo] = emotions_agg.get(emo, 0) + 1

        aggregate = {
            "total": len(results),
            "average_score": round(sum(scores) / len(scores), 1),
            "positive_count": sum(1 for s in scores if s > 60),
            "negative_count": sum(1 for s in scores if s < 40),
            "neutral_count": sum(1 for s in scores if 40 <= s <= 60),
            "score_distribution": {
                "very_positive": sum(1 for s in scores if s > 80),
                "positive": sum(1 for s in scores if 60 < s <= 80),
                "neutral": sum(1 for s in scores if 40 <= s <= 60),
                "negative": sum(1 for s in scores if 20 <= s < 40),
                "very_negative": sum(1 for s in scores if s < 20),
            },
            "top_categories": dict(sorted(categories.items(), key=lambda x: -x[1])[:5]),
            "top_emotions": dict(sorted(emotions_agg.items(), key=lambda x: -x[1])[:5]),
        }

        return {"results": results, "aggregate": aggregate}

    def _detect_emotions(self, text):
        """Detect emotions present in the text."""
        detected = []
        for emotion, words in self.EMOTION_WORDS.items():
            if any(w in text for w in words):
                detected.append(emotion)
        return detected if detected else ["neutral"]

    def _detect_category(self, text):
        """Auto-detect feedback category based on keywords."""
        scores = {}
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[category] = score

        if scores:
            return max(scores, key=scores.get)
        return "general"

    def _empty_result(self):
        return {
            "sentiment_score": 50,
            "classification": "neutral",
            "confidence": 0,
            "subjectivity": 0,
            "emotions": ["neutral"],
            "key_phrases": [],
            "category": "general",
            "sentence_analysis": [],
            "word_count": 0,
        }


# Quick test
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()

    test_feedbacks = [
        "The blockchain course was absolutely amazing! Professor explained concepts clearly.",
        "The lab equipment is outdated and wifi keeps disconnecting. Very frustrated.",
        "Decent course content but needs more practical exercises.",
        "I love the campus events and the coding clubs are very motivating!",
        "Administration is slow and unresponsive. Registration was a nightmare.",
    ]

    print("🧠 CampusTrust AI - Sentiment Analysis Demo\n")
    for fb in test_feedbacks:
        result = analyzer.analyze(fb)
        print(f"📝 \"{fb[:60]}...\"")
        print(f"   Score: {result['sentiment_score']}/100 ({result['classification']})")
        print(f"   Emotions: {', '.join(result['emotions'])}")
        print(f"   Category: {result['category']}")
        print(f"   Confidence: {result['confidence']}%\n")
