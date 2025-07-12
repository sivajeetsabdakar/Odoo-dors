#!/usr/bin/env python3
"""
Example script demonstrating URL-based content moderation
"""

import requests
import json

class URLModerationExamples:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def moderate_image_from_url(self, image_url):
        """Moderate an image from URL"""
        print(f"🖼️  Moderating image from URL: {image_url}")
        
        try:
            response = requests.post(
                f"{self.base_url}/moderate/image",
                data={"image_url": image_url}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Result: {result['moderation_action']}")
                print(f"   Confidence: {result['confidence']:.2f}")
                print(f"   Categories: {list(result['categories'].keys())}")
                print(f"   Reasons: {result['flagged_reasons']}")
                return result
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"   {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def moderate_video_from_url(self, video_url):
        """Moderate a video from URL"""
        print(f"🎥 Moderating video from URL: {video_url}")
        
        try:
            response = requests.post(
                f"{self.base_url}/moderate/video",
                data={"video_url": video_url}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Result: {result['moderation_action']}")
                print(f"   Confidence: {result['confidence']:.2f}")
                print(f"   Categories: {list(result['categories'].keys())}")
                print(f"   Reasons: {result['flagged_reasons']}")
                
                if 'video_metadata' in result:
                    metadata = result['video_metadata']
                    print(f"   Duration: {metadata.get('duration', 'N/A')}s")
                    print(f"   Frames: {metadata.get('total_frames', 'N/A')}")
                
                return result
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"   {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def moderate_batch_with_urls(self, text_content, image_url, video_url):
        """Moderate multiple content types using URLs"""
        print(f"📦 Batch moderating with URLs:")
        print(f"   Text: {text_content[:50]}...")
        print(f"   Image: {image_url}")
        print(f"   Video: {video_url}")
        
        try:
            data = {
                "text_content": text_content,
                "image_url": image_url,
                "video_url": video_url
            }
            
            response = requests.post(
                f"{self.base_url}/moderate/batch",
                data=data
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Overall decision: {result['overall_decision']}")
                
                for content_type, content_result in result['results'].items():
                    action = content_result['moderation_action']
                    confidence = content_result['confidence']
                    print(f"   {content_type}: {action} (confidence: {confidence:.2f})")
                
                return result
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"   {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

def main():
    """Run URL moderation examples"""
    print("🌐 URL-Based Content Moderation Examples")
    print("=" * 50)
    
    # Initialize examples
    examples = URLModerationExamples()
    
    # Example 1: Moderate image from URL
    print("\n1️⃣ Image Moderation Example")
    print("-" * 30)
    
    # Using a placeholder image service
    image_url = "https://via.placeholder.com/400x300/lightblue/000000?text=Test+Image"
    examples.moderate_image_from_url(image_url)
    
    # Example 2: Moderate video from URL
    print("\n2️⃣ Video Moderation Example")
    print("-" * 30)
    
    # Using a sample video URL (you can replace with actual video URLs)
    video_url = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
    examples.moderate_video_from_url(video_url)
    
    # Example 3: Batch moderation with URLs
    print("\n3️⃣ Batch Moderation Example")
    print("-" * 30)
    
    text_content = "This is a test message for batch moderation with URLs."
    image_url = "https://via.placeholder.com/400x300/green/ffffff?text=Safe+Image"
    video_url = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
    
    examples.moderate_batch_with_urls(text_content, image_url, video_url)
    
    # Example 4: Error handling
    print("\n4️⃣ Error Handling Example")
    print("-" * 30)
    
    # Test with invalid URL
    invalid_url = "https://invalid-url-that-does-not-exist.com/image.jpg"
    examples.moderate_image_from_url(invalid_url)
    
    print("\n🎉 Examples completed!")
    print("\n💡 Tips:")
    print("   - Use HTTPS URLs for better security")
    print("   - Ensure URLs are publicly accessible")
    print("   - Check file size limits (10MB for images, 100MB for videos)")
    print("   - Handle errors gracefully in production code")

if __name__ == "__main__":
    main() 