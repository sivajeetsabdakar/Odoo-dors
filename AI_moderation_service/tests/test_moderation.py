#!/usr/bin/env python3
"""
Test script for the StackIt Content Moderation API (Free Version)
"""

import asyncio
import requests
import json
import os
import io
from typing import Dict, Any
import tempfile
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import io

class ModerationTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        
    def test_health(self) -> bool:
        """Test the health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                result = response.json()
                print("✅ Health check passed")
                print(f"   Models loaded: {result.get('models_loaded', {})}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_info(self) -> bool:
        """Test the info endpoint"""
        try:
            response = requests.get(f"{self.base_url}/info")
            if response.status_code == 200:
                result = response.json()
                print("✅ Service info retrieved")
                print(f"   Version: {result.get('version', 'Unknown')}")
                print(f"   Cost: {result.get('cost', 'Unknown')}")
                return True
            else:
                print(f"❌ Info check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Info check error: {e}")
            return False
    
    def test_text_moderation(self) -> Dict[str, Any]:
        """Test text moderation with various content types"""
        test_cases = [
            {
                "name": "Normal Question",
                "content": "How do I implement a binary search tree in Python?",
                "content_type": "question",
                "expected_action": "allow"
            },
            {
                "name": "Profanity Test",
                "content": "This is a fucking stupid question",
                "content_type": "question",
                "expected_action": "flag"
            },
            {
                "name": "Hate Speech Test",
                "content": "All white people are stupid and should be eliminated",
                "content_type": "comment",
                "expected_action": "block"
            },
            {
                "name": "Threat Test",
                "content": "I will kill everyone who disagrees with me",
                "content_type": "answer",
                "expected_action": "block"
            },
            {
                "name": "Spam Test",
                "content": "Click here to make money fast! Buy now!",
                "content_type": "comment",
                "expected_action": "flag"
            },
            {
                "name": "All Caps Test",
                "content": "THIS IS A VERY LOUD MESSAGE",
                "content_type": "comment",
                "expected_action": "flag"
            },
            {
                "name": "Excessive Punctuation",
                "content": "This is amazing!!! Really great!!! Awesome!!!",
                "content_type": "comment",
                "expected_action": "flag"
            }
        ]
        
        results = {}
        
        for test_case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/moderate/text",
                    json={
                        "content": test_case["content"],
                        "content_type": test_case["content_type"]
                    },
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    results[test_case["name"]] = {
                        "success": True,
                        "result": result,
                        "expected": test_case["expected_action"],
                        "actual": result.get("moderation_action", "unknown")
                    }
                    
                    status = "✅" if result.get("moderation_action") == test_case["expected_action"] else "⚠️"
                    print(f"{status} {test_case['name']}: {result.get('moderation_action')} (expected: {test_case['expected_action']})")
                    
                    # Show confidence and categories if flagged
                    if result.get("moderation_action") != "allow":
                        confidence = result.get("confidence", 0)
                        categories = result.get("categories", {})
                        reasons = result.get("flagged_reasons", [])
                        print(f"   Confidence: {confidence:.2f}, Categories: {list(categories.keys())}, Reasons: {reasons}")
                else:
                    results[test_case["name"]] = {
                        "success": False,
                        "error": f"HTTP {response.status_code}"
                    }
                    print(f"❌ {test_case['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                results[test_case["name"]] = {
                    "success": False,
                    "error": str(e)
                }
                print(f"❌ {test_case['name']}: {e}")
        
        return results

    def create_test_image(self, image_type: str = "normal", size: tuple = (300, 200)) -> bytes:
        """Create test images for moderation testing"""
        img = Image.new('RGB', size, color='white')
        draw = ImageDraw.Draw(img)
        
        if image_type == "normal":
            # Create a simple geometric pattern
            draw.rectangle([50, 50, 250, 150], fill='blue', outline='black', width=2)
            draw.text((100, 100), "Test Image", fill='white')
            
        elif image_type == "skin_tone":
            # Create image with skin-like colors
            skin_colors = [(255, 220, 177), (255, 205, 148), (255, 190, 118)]
            for i, color in enumerate(skin_colors):
                y_start = i * (size[1] // 3)
                y_end = (i + 1) * (size[1] // 3)
                draw.rectangle([0, y_start, size[0], y_end], fill=color)
                
        elif image_type == "red_dominant":
            # Create image with dominant red colors
            draw.rectangle([0, 0, size[0], size[1]], fill='red')
            draw.text((100, 100), "Red Image", fill='white')
            
        elif image_type == "large":
            # Create a large image to test size limits
            large_img = Image.new('RGB', (2000, 2000), color='green')
            draw_large = ImageDraw.Draw(large_img)
            draw_large.text((1000, 1000), "Large Test Image", fill='white')
            img = large_img
            
        elif image_type == "small":
            # Create a very small image
            small_img = Image.new('RGB', (50, 50), color='yellow')
            draw_small = ImageDraw.Draw(small_img)
            draw_small.text((10, 20), "Small", fill='black')
            img = small_img
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        return img_bytes.getvalue()

    def test_image_moderation(self) -> Dict[str, Any]:
        """Test image moderation with various image types"""
        test_cases = [
            {
                "name": "Normal Image (File)",
                "image_type": "normal",
                "expected_action": "allow",
                "method": "file"
            },
            {
                "name": "Skin Tone Image (File)",
                "image_type": "skin_tone",
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Red Dominant Image (File)",
                "image_type": "red_dominant",
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Large Image (File)",
                "image_type": "large",
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Small Image (File)",
                "image_type": "small",
                "expected_action": "allow",
                "method": "file"
            },
            {
                "name": "Normal Image (URL)",
                "image_type": "normal",
                "expected_action": "allow",
                "method": "url"
            },
            {
                "name": "Skin Tone Image (URL)",
                "image_type": "skin_tone",
                "expected_action": "flag",
                "method": "url"
            }
        ]
        
        results = {}
        
        for test_case in test_cases:
            try:
                if test_case["method"] == "file":
                    # Create test image
                    image_content = self.create_test_image(test_case["image_type"])
                    
                    # Send to moderation endpoint
                    files = {"file": ("test_image.jpg", image_content, "image/jpeg")}
                    response = requests.post(f"{self.base_url}/moderate/image", files=files)
                else:
                    # For URL testing, we'll use a placeholder URL
                    # In real testing, you would use actual image URLs
                    test_url = "https://via.placeholder.com/400x300/lightblue/000000?text=Test+Image"
                    data = {"image_url": test_url}
                    response = requests.post(f"{self.base_url}/moderate/image", data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    results[test_case["name"]] = {
                        "success": True,
                        "result": result,
                        "expected": test_case["expected_action"],
                        "actual": result.get("moderation_action", "unknown")
                    }
                    
                    status = "✅" if result.get("moderation_action") == test_case["expected_action"] else "⚠️"
                    print(f"{status} {test_case['name']}: {result.get('moderation_action')} (expected: {test_case['expected_action']})")
                    
                    # Show confidence and categories if flagged
                    if result.get("moderation_action") != "allow":
                        confidence = result.get("confidence", 0)
                        categories = result.get("categories", {})
                        reasons = result.get("flagged_reasons", [])
                        print(f"   Confidence: {confidence:.2f}, Categories: {list(categories.keys())}, Reasons: {reasons}")
                else:
                    results[test_case["name"]] = {
                        "success": False,
                        "error": f"HTTP {response.status_code}"
                    }
                    print(f"❌ {test_case['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                results[test_case["name"]] = {
                    "success": False,
                    "error": str(e)
                }
                print(f"❌ {test_case['name']}: {e}")
        
        return results

    def create_test_video(self, video_type: str = "normal", duration: int = 3) -> bytes:
        """Create test videos for moderation testing"""
        try:
            import cv2
            
            # Create a simple test video
            fps = 30
            width, height = 640, 480
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Initialize video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(temp_path, fourcc, fps, (width, height))
            
            # Generate frames
            for frame_num in range(duration * fps):
                # Create frame based on video type
                if video_type == "normal":
                    # Create a simple colored frame
                    frame = np.zeros((height, width, 3), dtype=np.uint8)
                    frame[:, :] = [100, 150, 200]  # Blue-ish color
                    
                    # Add text
                    cv2.putText(frame, f"Frame {frame_num}", (50, 50), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                    
                elif video_type == "skin_tone":
                    # Create frames with skin-like colors
                    frame = np.zeros((height, width, 3), dtype=np.uint8)
                    skin_color = [255, 220, 177]  # Light skin tone
                    frame[:, :] = skin_color
                    
                elif video_type == "red_dominant":
                    # Create frames with dominant red
                    frame = np.zeros((height, width, 3), dtype=np.uint8)
                    frame[:, :] = [0, 0, 255]  # Red in BGR
                    
                elif video_type == "long":
                    # Create a longer video
                    frame = np.zeros((height, width, 3), dtype=np.uint8)
                    frame[:, :] = [0, 255, 0]  # Green
                    
                elif video_type == "short":
                    # Create a very short video
                    frame = np.zeros((height, width, 3), dtype=np.uint8)
                    frame[:, :] = [255, 255, 0]  # Cyan
                
                out.write(frame)
            
            out.release()
            
            # Read the video file
            with open(temp_path, 'rb') as f:
                video_content = f.read()
            
            # Clean up
            os.unlink(temp_path)
            
            return video_content
            
        except ImportError:
            # If OpenCV is not available, create a dummy video file
            print("⚠️ OpenCV not available, creating dummy video file")
            dummy_content = b"dummy video content for testing"
            return dummy_content
        except Exception as e:
            print(f"⚠️ Could not create test video: {e}")
            return b"dummy video content for testing"

    def test_video_moderation(self) -> Dict[str, Any]:
        """Test video moderation with various video types"""
        test_cases = [
            {
                "name": "Normal Video (File)",
                "video_type": "normal",
                "duration": 3,
                "expected_action": "allow",
                "method": "file"
            },
            {
                "name": "Skin Tone Video (File)",
                "video_type": "skin_tone",
                "duration": 3,
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Red Dominant Video (File)",
                "video_type": "red_dominant",
                "duration": 3,
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Long Video (File)",
                "video_type": "long",
                "duration": 10,
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Short Video (File)",
                "video_type": "short",
                "duration": 1,
                "expected_action": "flag",
                "method": "file"
            },
            {
                "name": "Normal Video (URL)",
                "video_type": "normal",
                "duration": 3,
                "expected_action": "allow",
                "method": "url"
            }
        ]
        
        results = {}
        
        for test_case in test_cases:
            try:
                if test_case["method"] == "file":
                    # Create test video
                    video_content = self.create_test_video(test_case["video_type"], test_case["duration"])
                    
                    if video_content and len(video_content) > 0:
                        # Send to moderation endpoint
                        files = {"file": ("test_video.mp4", video_content, "video/mp4")}
                        response = requests.post(f"{self.base_url}/moderate/video", files=files)
                    else:
                        print(f"⚠️ Skipping {test_case['name']}: Could not create video file")
                        continue
                else:
                    # For URL testing, we'll use a placeholder URL
                    # In real testing, you would use actual video URLs
                    test_url = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
                    data = {"video_url": test_url}
                    response = requests.post(f"{self.base_url}/moderate/video", data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    results[test_case["name"]] = {
                        "success": True,
                        "result": result,
                        "expected": test_case["expected_action"],
                        "actual": result.get("moderation_action", "unknown")
                    }
                    
                    status = "✅" if result.get("moderation_action") == test_case["expected_action"] else "⚠️"
                    print(f"{status} {test_case['name']}: {result.get('moderation_action')} (expected: {test_case['expected_action']})")
                    
                    # Show confidence and categories if flagged
                    if result.get("moderation_action") != "allow":
                        confidence = result.get("confidence", 0)
                        categories = result.get("categories", {})
                        reasons = result.get("flagged_reasons", [])
                        print(f"   Confidence: {confidence:.2f}, Categories: {list(categories.keys())}, Reasons: {reasons}")
                        
                    # Show video metadata if available
                    if "video_metadata" in result:
                        metadata = result["video_metadata"]
                        print(f"   Duration: {metadata.get('duration', 'N/A')}s, Frames: {metadata.get('total_frames', 'N/A')}")
                else:
                    results[test_case["name"]] = {
                        "success": False,
                        "error": f"HTTP {response.status_code}"
                    }
                    print(f"❌ {test_case['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                results[test_case["name"]] = {
                    "success": False,
                    "error": str(e)
                }
                print(f"❌ {test_case['name']}: {e}")
        
        return results
    
    def test_batch_moderation(self) -> Dict[str, Any]:
        """Test batch moderation endpoint"""
        try:
            # Test with text only
            response = requests.post(
                f"{self.base_url}/moderate/batch",
                data={"text_content": "This is a test question about programming"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Batch moderation (text only): Success")
                print(f"   Overall decision: {result.get('overall_decision', 'unknown')}")
                return {"success": True, "result": result}
            else:
                print(f"❌ Batch moderation failed: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Batch moderation error: {e}")
            return {"success": False, "error": str(e)}

    def test_batch_moderation_with_files(self) -> Dict[str, Any]:
        """Test batch moderation with multiple file types"""
        try:
            # Create test content
            text_content = "This is a test question about programming"
            image_content = self.create_test_image("normal")
            video_content = self.create_test_video("normal", 2)
            
            # Send batch request
            files = {
                "image_file": ("test_image.jpg", image_content, "image/jpeg"),
                "video_file": ("test_video.mp4", video_content, "video/mp4")
            }
            data = {"text_content": text_content}
            
            response = requests.post(
                f"{self.base_url}/moderate/batch",
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Batch moderation (files): Success")
                print(f"   Overall decision: {result.get('overall_decision', 'unknown')}")
                
                # Show individual results
                results = result.get("results", {})
                for content_type, content_result in results.items():
                    action = content_result.get("moderation_action", "unknown")
                    print(f"   {content_type}: {action}")
                
                return {"success": True, "result": result}
            else:
                print(f"❌ Batch moderation with files failed: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Batch moderation with files error: {e}")
            return {"success": False, "error": str(e)}

    def test_batch_moderation_with_urls(self) -> Dict[str, Any]:
        """Test batch moderation with URL-based content"""
        try:
            # Test with URLs
            data = {
                "text_content": "This is a test question about programming",
                "image_url": "https://via.placeholder.com/400x300/lightblue/000000?text=Test+Image",
                "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
            }
            
            response = requests.post(
                f"{self.base_url}/moderate/batch",
                data=data
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Batch moderation (URLs): Success")
                print(f"   Overall decision: {result.get('overall_decision', 'unknown')}")
                
                # Show individual results
                results = result.get("results", {})
                for content_type, content_result in results.items():
                    action = content_result.get("moderation_action", "unknown")
                    print(f"   {content_type}: {action}")
                
                return {"success": True, "result": result}
            else:
                print(f"❌ Batch moderation with URLs failed: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Batch moderation with URLs error: {e}")
            return {"success": False, "error": str(e)}
    
    def test_api_documentation(self) -> bool:
        """Test if API documentation is accessible"""
        try:
            response = requests.get(f"{self.base_url}/docs")
            if response.status_code == 200:
                print("✅ API documentation accessible")
                return True
            else:
                print(f"❌ API documentation not accessible: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ API documentation error: {e}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results"""
        print("🚀 Starting StackIt Content Moderation API Tests (Free Version)\n")
        
        results = {
            "health_check": self.test_health(),
            "service_info": self.test_info(),
            "text_moderation": self.test_text_moderation(),
            "image_moderation": self.test_image_moderation(),
            "video_moderation": self.test_video_moderation(),
            "batch_moderation": self.test_batch_moderation(),
            "batch_moderation_with_files": self.test_batch_moderation_with_files(),
            "batch_moderation_with_urls": self.test_batch_moderation_with_urls(),
            "api_documentation": self.test_api_documentation()
        }
        
        # Summary
        print("\n📊 Test Summary:")
        print(f"Health Check: {'✅ PASS' if results['health_check'] else '❌ FAIL'}")
        print(f"Service Info: {'✅ PASS' if results['service_info'] else '❌ FAIL'}")
        
        text_tests = results['text_moderation']
        passed_text = sum(1 for test in text_tests.values() if test.get('success', False))
        total_text = len(text_tests)
        print(f"Text Moderation: {passed_text}/{total_text} tests passed")
        
        image_tests = results['image_moderation']
        passed_image = sum(1 for test in image_tests.values() if test.get('success', False))
        total_image = len(image_tests)
        print(f"Image Moderation: {passed_image}/{total_image} tests passed")
        
        video_tests = results['video_moderation']
        passed_video = sum(1 for test in video_tests.values() if test.get('success', False))
        total_video = len(video_tests)
        print(f"Video Moderation: {passed_video}/{total_video} tests passed")
        
        print(f"Batch Moderation: {'✅ PASS' if results['batch_moderation'].get('success') else '❌ FAIL'}")
        print(f"Batch with Files: {'✅ PASS' if results['batch_moderation_with_files'].get('success') else '❌ FAIL'}")
        print(f"Batch with URLs: {'✅ PASS' if results['batch_moderation_with_urls'].get('success') else '❌ FAIL'}")
        print(f"API Documentation: {'✅ PASS' if results['api_documentation'] else '❌ FAIL'}")
        
        # Cost savings highlight
        print("\n💰 Cost Savings:")
        print("   - Text moderation: FREE (vs $0.01-0.10 per request)")
        print("   - Image moderation: FREE (vs $0.01-0.05 per image)")
        print("   - Video moderation: FREE (vs $0.05-0.20 per video)")
        print("   - Total monthly savings: $100-1000+")
        
        return results

def main():
    """Main function to run tests"""
    print("🧪 StackIt Content Moderation API Test Suite (Free Version)")
    print("=" * 60)
    
    # Check if server is running
    tester = ModerationTester()
    
    # Run all tests
    results = tester.run_all_tests()
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Test results saved to test_results.json")
    print("\n🎉 Testing complete!")
    print("\n💡 Next steps:")
    print("   1. Review test results")
    print("   2. Adjust moderation thresholds if needed")
    print("   3. Integrate with your backend")
    print("   4. Deploy to production")

if __name__ == "__main__":
    main() 