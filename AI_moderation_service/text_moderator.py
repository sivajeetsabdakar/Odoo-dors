import re
import os
from typing import Dict, List, Any
import asyncio
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import nltk
from textblob import TextBlob
import torch

class TextModerator:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        # Initialize free text classification models
        self.toxicity_classifier = None
        self.sentiment_analyzer = None
        self._load_models()
        
        # Custom profanity and inappropriate patterns
        self.profanity_patterns = [
            r'\b(fuck|shit|bitch|asshole|dick|pussy|cunt)\b',
            r'\b(nigger|faggot|retard|whore|slut)\b',
            r'\b(kill yourself|kys|stfu|gtfo)\b'
        ]
        
        # Hate speech patterns
        self.hate_speech_patterns = [
            r'\b(all\s+(white|black|jews|muslims|gays))\s+(are|should)\b',
            r'\b(white\s+supremacy|racial\s+superiority)\b',
            r'\b(hitler|nazi|fascist)\b',
            r'\b(genocide|ethnic\s+cleansing)\b'
        ]
        
        # Threat patterns
        self.threat_patterns = [
            r'\b(i\s+will\s+kill|i\s+want\s+to\s+kill)\b',
            r'\b(bomb|shoot|attack|murder)\s+(you|them|everyone)\b',
            r'\b(die|death|suicide)\b'
        ]
        
        # Spam patterns
        self.spam_patterns = [
            r'\b(buy\s+now|click\s+here|free\s+money|make\s+money\s+fast)\b',
            r'\b(viagra|casino|lottery|winner)\b',
            r'(http|www)\.[^\s]+',
            r'\b(bit\.ly|tinyurl|goo\.gl)\b'
        ]
        
        # Compile patterns
        self.profanity_regex = re.compile('|'.join(self.profanity_patterns), re.IGNORECASE)
        self.hate_speech_regex = re.compile('|'.join(self.hate_speech_patterns), re.IGNORECASE)
        self.threat_regex = re.compile('|'.join(self.threat_patterns), re.IGNORECASE)
        self.spam_regex = re.compile('|'.join(self.spam_patterns), re.IGNORECASE)

    def _load_models(self):
        """Load free Hugging Face models for text classification"""
        # Check for GPU availability
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🖥️ Using device: {device}")
        
        try:
            # Load toxicity classifier (free model)
            self.toxicity_classifier = pipeline(
                "text-classification",
                model="unitary/toxic-bert",
                top_k=None,
                device=device
            )
            print(f"✅ Loaded toxicity classifier on {device}")
        except Exception as e:
            print(f"⚠️ Could not load toxicity classifier: {e}")
            self.toxicity_classifier = None
        
        try:
            # Load sentiment analyzer (using a more compatible model)
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=device
            )
            print(f"✅ Loaded sentiment analyzer on {device}")
        except Exception as e:
            print(f"⚠️ Could not load sentiment analyzer: {e}")
            self.sentiment_analyzer = None

    async def moderate(self, content: str, content_type: str = "text") -> Dict[str, Any]:
        """
        Moderate text content using free AI models and custom rules
        """
        try:
            # Run AI model analysis
            ai_result = await self._moderate_with_ai(content)
            
            # Run custom pattern matching
            custom_result = self._moderate_with_patterns(content)
            
            # Combine results
            combined_result = self._combine_results(ai_result, custom_result, content_type)
            
            return combined_result
            
        except Exception as e:
            # Fallback to pattern matching only
            print(f"AI moderation failed: {e}")
            custom_result = self._moderate_with_patterns(content)
            return self._format_result(custom_result, content_type)

    async def _moderate_with_ai(self, content: str) -> Dict[str, Any]:
        """
        Use free Hugging Face models for text analysis
        """
        try:
            categories = {}
            flagged_reasons = []
            
            # Use toxicity classifier if available
            if self.toxicity_classifier:
                toxicity_result = self.toxicity_classifier(content)
                for item in toxicity_result[0]:
                    label = item['label']
                    score = item['score']
                    
                    if score > 0.5:  # Only consider significant scores
                        categories[label] = score
                        
                        # Map toxicity labels to our categories
                        if label in ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']:
                            if score > 0.7:
                                flagged_reasons.append(label)
            
            # Use sentiment analyzer if available
            if self.sentiment_analyzer:
                try:
                    sentiment_result = self.sentiment_analyzer(content)
                    sentiment = sentiment_result[0]
                    
                    # Flag very negative sentiment as potentially problematic
                    if sentiment['label'] == 'NEGATIVE' and sentiment['score'] > 0.8:
                        categories['negative_sentiment'] = sentiment['score']
                        flagged_reasons.append('negative_sentiment')
                except Exception as e:
                    print(f"Sentiment analysis failed: {e}")
                    # Fallback to TextBlob sentiment
                    blob = TextBlob(content)
                    if blob.sentiment.polarity < -0.5:
                        categories['negative_sentiment'] = abs(blob.sentiment.polarity)
                        flagged_reasons.append('negative_sentiment')
            else:
                # Use TextBlob as fallback
                blob = TextBlob(content)
                if blob.sentiment.polarity < -0.5:
                    categories['negative_sentiment'] = abs(blob.sentiment.polarity)
                    flagged_reasons.append('negative_sentiment')
            
            # Use TextBlob for additional analysis (only if not already used for sentiment)
            if not self.sentiment_analyzer:
                blob = TextBlob(content)
            
            # Check for excessive punctuation (spam indicator)
            punctuation_count = sum(1 for char in content if char in '!?')
            if punctuation_count > len(content.split()) * 0.3:  # More than 30% of words have punctuation
                categories['excessive_punctuation'] = min(punctuation_count / len(content.split()), 1.0)
                flagged_reasons.append('excessive_punctuation')
            
            # Check for all caps (shouting indicator)
            if content.isupper() and len(content.split()) > 3:
                categories['all_caps'] = 0.8
                flagged_reasons.append('all_caps')
            
            return {
                "flagged": len(flagged_reasons) > 0,
                "categories": categories,
                "flagged_reasons": flagged_reasons
            }
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                "flagged": False,
                "categories": {},
                "flagged_reasons": []
            }

    def _moderate_with_patterns(self, content: str) -> Dict[str, Any]:
        """
        Use custom regex patterns for moderation
        """
        issues = []
        categories = {}
        
        # Check profanity
        profanity_matches = self.profanity_regex.findall(content)
        if profanity_matches:
            issues.append("profanity")
            categories["profanity"] = min(len(profanity_matches) * 0.3, 1.0)
        
        # Check hate speech
        hate_matches = self.hate_speech_regex.findall(content)
        if hate_matches:
            issues.append("hate_speech")
            categories["hate_speech"] = min(len(hate_matches) * 0.5, 1.0)
        
        # Check threats
        threat_matches = self.threat_regex.findall(content)
        if threat_matches:
            issues.append("threats")
            categories["threats"] = min(len(threat_matches) * 0.6, 1.0)
        
        # Check spam
        spam_matches = self.spam_regex.findall(content)
        if spam_matches:
            issues.append("spam")
            categories["spam"] = min(len(spam_matches) * 0.4, 1.0)
        
        return {
            "flagged": len(issues) > 0,
            "issues": issues,
            "categories": categories
        }

    def _combine_results(self, ai_result: Dict, custom_result: Dict, content_type: str) -> Dict[str, Any]:
        """
        Combine AI and custom moderation results
        """
        # Determine if content should be flagged
        ai_flagged = ai_result.get("flagged", False)
        custom_flagged = custom_result.get("flagged", False)
        
        # Combine categories
        combined_categories = {}
        
        # Add AI categories
        combined_categories.update(ai_result.get("categories", {}))
        
        # Add custom categories
        combined_categories.update(custom_result.get("categories", {}))
        
        # Determine overall flag status
        is_flagged = ai_flagged or custom_flagged
        
        # Calculate confidence based on highest score
        confidence = max(combined_categories.values()) if combined_categories else 0.0
        
        # Determine moderation action based on content type and severity
        moderation_action = self._determine_action(is_flagged, confidence, content_type, combined_categories)
        
        # Get flagged reasons
        flagged_reasons = []
        flagged_reasons.extend(ai_result.get("flagged_reasons", []))
        flagged_reasons.extend(custom_result.get("issues", []))
        
        return {
            "is_appropriate": not is_flagged,
            "confidence": confidence,
            "categories": combined_categories,
            "flagged_reasons": list(set(flagged_reasons)),  # Remove duplicates
            "moderation_action": moderation_action
        }

    def _determine_action(self, is_flagged: bool, confidence: float, content_type: str, categories: Dict) -> str:
        """
        Determine moderation action based on severity and content type
        """
        if not is_flagged:
            return "allow"
        
        # High confidence threats or hate speech should be blocked
        if confidence > 0.8:
            if "threats" in categories or "hate_speech" in categories or "threat" in categories:
                return "block"
        
        # Medium confidence or spam should be flagged for review
        if confidence > 0.6:
            return "flag"
        
        # Low confidence might be allowed but flagged
        return "flag"

    def _format_result(self, custom_result: Dict, content_type: str) -> Dict[str, Any]:
        """
        Format custom result for API response
        """
        confidence = max(custom_result.get("categories", {}).values()) if custom_result.get("categories") else 0.0
        
        return {
            "is_appropriate": not custom_result.get("flagged", False),
            "confidence": confidence,
            "categories": custom_result.get("categories", {}),
            "flagged_reasons": custom_result.get("issues", []),
            "moderation_action": "flag" if custom_result.get("flagged") else "allow"
        } 