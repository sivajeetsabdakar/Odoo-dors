import io
import os
import requests
from typing import Dict, Any, Union
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
import cv2
import asyncio
from sklearn.cluster import KMeans
from collections import Counter

class ImageModerator:
    def __init__(self):
        # NSFW detection thresholds
        self.nsfw_threshold = 0.6
        self.violence_threshold = 0.7
        self.drugs_threshold = 0.6
        
        # Supported image formats
        self.supported_formats = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp']
        
        # Load OpenCV cascade classifiers for object detection
        self.face_cascade = None
        self.body_cascade = None
        self._load_cascades()

    def _load_cascades(self):
        """Load OpenCV cascade classifiers for object detection"""
        try:
            # Check if cv2.data is available
            if hasattr(cv2, 'data'):
                # Load face detection cascade
                self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                
                # Load body detection cascade
                self.body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')
                
                print("✅ Loaded OpenCV cascade classifiers")
            else:
                # Fallback: try to find cascade files in common locations
                cascade_paths = [
                    "haarcascade_frontalface_default.xml",
                    "haarcascade_fullbody.xml"
                ]
                
                # Try to load from current directory or system paths
                for cascade_file in cascade_paths:
                    if os.path.exists(cascade_file):
                        if "face" in cascade_file:
                            self.face_cascade = cv2.CascadeClassifier(cascade_file)
                        elif "body" in cascade_file:
                            self.body_cascade = cv2.CascadeClassifier(cascade_file)
                
                if self.face_cascade or self.body_cascade:
                    print("✅ Loaded OpenCV cascade classifiers from local files")
                else:
                    print("⚠️ Could not load cascade classifiers - will use alternative detection methods")
                    
        except Exception as e:
            print(f"⚠️ Could not load cascade classifiers: {e}")

    async def moderate(self, image_input: Union[bytes, str]) -> Dict[str, Any]:
        """
        Moderate image content using free computer vision techniques
        
        Args:
            image_input: Either image bytes or image URL
        """
        try:
            # Handle URL input
            if isinstance(image_input, str) and (image_input.startswith('http://') or image_input.startswith('https://')):
                image_content = await self._download_image(image_input)
            else:
                image_content = image_input
            
            # Validate image format
            image = Image.open(io.BytesIO(image_content))
            if image.format.lower() not in self.supported_formats:
                return {
                    "is_appropriate": False,
                    "confidence": 1.0,
                    "categories": {"unsupported_format": 1.0},
                    "flagged_reasons": ["unsupported_format"],
                    "moderation_action": "block"
                }
            
            # Run multiple moderation checks
            results = await asyncio.gather(
                self._moderate_with_color_analysis(image_content),
                self._moderate_with_object_detection(image_content),
                self._moderate_with_texture_analysis(image_content),
                self._moderate_with_custom_rules(image_content),
                return_exceptions=True
            )
            
            # Combine results
            combined_result = self._combine_image_results(results)
            return combined_result
            
        except Exception as e:
            print(f"Image moderation failed: {e}")
            return {
                "is_appropriate": False,
                "confidence": 0.0,
                "categories": {"error": 1.0},
                "flagged_reasons": ["processing_error"],
                "moderation_action": "flag"
            }

    async def _download_image(self, url: str) -> bytes:
        """
        Download image from URL
        """
        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not content_type.startswith('image/'):
                raise ValueError(f"URL does not point to an image: {content_type}")
            
            # Download image content
            image_content = response.content
            
            # Validate it's actually an image
            try:
                Image.open(io.BytesIO(image_content))
            except Exception:
                raise ValueError("Downloaded content is not a valid image")
            
            return image_content
            
        except requests.RequestException as e:
            raise ValueError(f"Failed to download image from URL: {e}")
        except Exception as e:
            raise ValueError(f"Error processing image URL: {e}")

    async def _moderate_with_color_analysis(self, image_content: bytes) -> Dict[str, Any]:
        """
        Analyze image colors for potential inappropriate content
        """
        try:
            # Convert to OpenCV format
            nparr = np.frombuffer(image_content, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"error": "Could not decode image"}
            
            # Convert to RGB for analysis
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Analyze skin tone detection (potential NSFW indicator)
            skin_score = self._detect_skin_tone(img_rgb)
            
            # Analyze color distribution
            color_analysis = self._analyze_color_distribution(img_rgb)
            
            categories = {}
            flagged_reasons = []
            
            # Flag if high skin tone percentage (potential NSFW)
            if skin_score > 0.4:  # More than 40% skin tone
                categories['high_skin_tone'] = skin_score
                flagged_reasons.append('high_skin_tone')
            
            # Flag if too much red (potential violence/blood)
            if color_analysis.get('red_dominance', 0) > 0.6:
                categories['red_dominance'] = color_analysis['red_dominance']
                flagged_reasons.append('red_dominance')
            
            return {
                "categories": categories,
                "flagged": len(flagged_reasons) > 0,
                "flagged_reasons": flagged_reasons
            }
            
        except Exception as e:
            return {"error": str(e)}

    def _detect_skin_tone(self, img_rgb):
        """Detect skin tone in image using color ranges"""
        try:
            # Define skin color ranges in RGB
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            
            # Convert to HSV for better skin detection
            img_hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
            
            # Create mask for skin tones
            skin_mask = cv2.inRange(img_hsv, lower_skin, upper_skin)
            
            # Calculate percentage of skin pixels
            total_pixels = img_rgb.shape[0] * img_rgb.shape[1]
            skin_pixels = cv2.countNonZero(skin_mask)
            
            return skin_pixels / total_pixels if total_pixels > 0 else 0
            
        except Exception as e:
            print(f"Skin tone detection error: {e}")
            return 0

    def _analyze_color_distribution(self, img_rgb):
        """Analyze color distribution in image"""
        try:
            # Reshape image to 2D array of pixels
            pixels = img_rgb.reshape(-1, 3)
            
            # Calculate mean color values
            mean_r = np.mean(pixels[:, 0])
            mean_g = np.mean(pixels[:, 1])
            mean_b = np.mean(pixels[:, 2])
            
            # Calculate color dominance
            total = mean_r + mean_g + mean_b
            if total > 0:
                red_dominance = mean_r / total
                green_dominance = mean_g / total
                blue_dominance = mean_b / total
            else:
                red_dominance = green_dominance = blue_dominance = 0
            
            return {
                'red_dominance': red_dominance,
                'green_dominance': green_dominance,
                'blue_dominance': blue_dominance,
                'mean_r': mean_r,
                'mean_g': mean_g,
                'mean_b': mean_b
            }
            
        except Exception as e:
            print(f"Color analysis error: {e}")
            return {}

    async def _moderate_with_object_detection(self, image_content: bytes) -> Dict[str, Any]:
        """
        Use OpenCV for object detection
        """
        try:
            # Convert to OpenCV format
            nparr = np.frombuffer(image_content, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
            
            if img is None:
                return {"error": "Could not decode image"}
            
            categories = {}
            flagged_reasons = []
            
            # Face detection
            if self.face_cascade:
                faces = self.face_cascade.detectMultiScale(img, 1.1, 4)
                if len(faces) > 0:
                    categories['faces_detected'] = len(faces)
                    # Multiple faces might indicate inappropriate content
                    if len(faces) > 5:
                        flagged_reasons.append('many_faces')
            
            # Body detection
            if self.body_cascade:
                bodies = self.body_cascade.detectMultiScale(img, 1.1, 4)
                if len(bodies) > 0:
                    categories['bodies_detected'] = len(bodies)
                    # Multiple bodies might indicate inappropriate content
                    if len(bodies) > 3:
                        flagged_reasons.append('many_bodies')
            
            # Edge detection for potential weapon shapes
            edges = cv2.Canny(img, 50, 150)
            edge_density = np.sum(edges > 0) / (img.shape[0] * img.shape[1])
            
            if edge_density > 0.1:  # High edge density might indicate weapons
                categories['high_edge_density'] = edge_density
                flagged_reasons.append('high_edge_density')
            
            return {
                "categories": categories,
                "flagged": len(flagged_reasons) > 0,
                "flagged_reasons": flagged_reasons
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def _moderate_with_texture_analysis(self, image_content: bytes) -> Dict[str, Any]:
        """
        Analyze image texture for patterns
        """
        try:
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_content))
            
            # Convert to grayscale for texture analysis
            gray = image.convert('L')
            gray_array = np.array(gray)
            
            categories = {}
            flagged_reasons = []
            
            # Analyze texture patterns
            # High variance might indicate inappropriate content
            texture_variance = np.var(gray_array)
            if texture_variance > 5000:  # High variance threshold
                categories['high_texture_variance'] = min(texture_variance / 10000, 1.0)
                flagged_reasons.append('high_texture_variance')
            
            # Analyze brightness
            brightness = np.mean(gray_array)
            if brightness < 50:  # Very dark image
                categories['low_brightness'] = 1.0 - (brightness / 255)
                flagged_reasons.append('low_brightness')
            elif brightness > 200:  # Very bright image
                categories['high_brightness'] = brightness / 255
                flagged_reasons.append('high_brightness')
            
            return {
                "categories": categories,
                "flagged": len(flagged_reasons) > 0,
                "flagged_reasons": flagged_reasons
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def _moderate_with_custom_rules(self, image_content: bytes) -> Dict[str, Any]:
        """
        Apply custom image analysis rules
        """
        try:
            image = Image.open(io.BytesIO(image_content))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Basic image analysis
            width, height = image.size
            aspect_ratio = width / height
            
            # Check for extremely small images (might be inappropriate thumbnails)
            if width < 50 or height < 50:
                return {
                    "categories": {"suspicious_size": 0.8},
                    "flagged": True,
                    "flagged_reasons": ["suspicious_size"]
                }
            
            # Check for extremely large images (might be spam)
            if width > 5000 or height > 5000:
                return {
                    "categories": {"oversized": 0.6},
                    "flagged": True,
                    "flagged_reasons": ["oversized"]
                }
            
            # Check for unusual aspect ratios
            if aspect_ratio > 10 or aspect_ratio < 0.1:
                return {
                    "categories": {"unusual_aspect": 0.5},
                    "flagged": True,
                    "flagged_reasons": ["unusual_aspect"]
                }
            
            # Check for very low file size (might be inappropriate)
            if len(image_content) < 1000:  # Less than 1KB
                return {
                    "categories": {"very_small_file": 0.7},
                    "flagged": True,
                    "flagged_reasons": ["very_small_file"]
                }
            
            return {
                "categories": {},
                "flagged": False,
                "flagged_reasons": []
            }
            
        except Exception as e:
            return {"error": str(e)}

    def _combine_image_results(self, results: list) -> Dict[str, Any]:
        """
        Combine results from multiple image moderation techniques
        """
        combined_categories = {}
        all_flagged_reasons = []
        errors = []
        
        for result in results:
            if isinstance(result, Exception):
                errors.append(str(result))
                continue
                
            if "error" in result:
                errors.append(result["error"])
                continue
            
            # Combine categories
            if "categories" in result:
                for category, score in result["categories"].items():
                    if category in combined_categories:
                        # Take the higher score
                        combined_categories[category] = max(combined_categories[category], score)
                    else:
                        combined_categories[category] = score
            
            # Combine flagged reasons
            if "flagged_reasons" in result:
                all_flagged_reasons.extend(result["flagged_reasons"])
        
        # Determine overall flag status
        is_flagged = len(all_flagged_reasons) > 0
        
        # Calculate confidence based on highest score
        confidence = max(combined_categories.values()) if combined_categories else 0.0
        
        # Determine moderation action
        moderation_action = self._determine_image_action(is_flagged, confidence, combined_categories)
        
        return {
            "is_appropriate": not is_flagged,
            "confidence": confidence,
            "categories": combined_categories,
            "flagged_reasons": list(set(all_flagged_reasons)),  # Remove duplicates
            "moderation_action": moderation_action,
            "errors": errors if errors else None
        }

    def _determine_image_action(self, is_flagged: bool, confidence: float, categories: Dict) -> str:
        """
        Determine moderation action for images
        """
        if not is_flagged:
            return "allow"
        
        # High confidence NSFW indicators should be blocked
        if confidence > 0.8:
            if "high_skin_tone" in categories:
                return "block"
        
        # High confidence suspicious patterns should be blocked
        if confidence > 0.7:
            if "high_edge_density" in categories or "red_dominance" in categories:
                return "block"
        
        # Medium confidence should be flagged for review
        if confidence > 0.5:
            return "flag"
        
        # Low confidence might be allowed but flagged
        return "flag" 