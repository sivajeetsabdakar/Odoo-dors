#!/usr/bin/env python3
"""
Standalone test script for image and video moderation
"""

import requests
import json
import os
import io
import tempfile
from PIL import Image, ImageDraw
import numpy as np

def create_sample_image(image_type="normal", filename="test_image.jpg"):
    """Create a sample image for testing"""
    print(f"Creating {image_type} image...")
    
    if image_type == "normal":
        # Create a simple test image
        img = Image.new('RGB', (400, 300), color='lightblue')
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 350, 250], fill='white', outline='black', width=3)
        draw.text((150, 150), "Test Image", fill='black')
        
    elif image_type == "skin_tone":
        # Create image with skin-like colors
        img = Image.new('RGB', (400, 300), color='white')
        draw = ImageDraw.Draw(img)
        
        # Create skin tone patches
        skin_colors = [(255, 220, 177), (255, 205, 148), (255, 190, 118)]
        for i, color in enumerate(skin_colors):
            y_start = i * 100
            y_end = (i + 1) * 100
            draw.rectangle([0, y_start, 400, y_end], fill=color)
            
    elif image_type == "red_dominant":
        # Create image with dominant red
        img = Image.new('RGB', (400, 300), color='red')
        draw = ImageDraw.Draw(img)
        draw.text((150, 150), "Red Image", fill='white')
        
    elif image_type == "large":
        # Create a large image
        img = Image.new('RGB', (2000, 1500), color='green')
        draw = ImageDraw.Draw(img)
        draw.text((1000, 750), "Large Test Image", fill='white')
        
    elif image_type == "small":
        # Create a small image
        img = Image.new('RGB', (100, 100), color='yellow')
        draw = ImageDraw.Draw(img)
        draw.text((20, 40), "Small", fill='black')
    
    # Save image
    img.save(filename)
    print(f"✅ Created {filename}")
    return filename

def create_sample_video(video_type="normal", filename="test_video.mp4", duration=3):
    """Create a sample video for testing"""
    print(f"Creating {video_type} video...")
    
    try:
        import cv2
        
        fps = 30
        width, height = 640, 480
        
        # Initialize video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(filename, fourcc, fps, (width, height))
        
        # Generate frames
        for frame_num in range(duration * fps):
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
        print(f"✅ Created {filename}")
        return filename
        
    except ImportError:
        print("⚠️ OpenCV not available, creating dummy video file")
        # Create a dummy video file
        with open(filename, 'wb') as f:
            f.write(b"dummy video content for testing")
        return filename
    except Exception as e:
        print(f"❌ Could not create video: {e}")
        return None

def test_image_moderation(base_url="http://localhost:8000"):
    """Test image moderation with various image types"""
    print("\n🖼️  Testing Image Moderation")
    print("=" * 40)
    
    test_cases = [
        {"type": "normal", "expected": "allow"},
        {"type": "skin_tone", "expected": "flag"},
        {"type": "red_dominant", "expected": "flag"},
        {"type": "large", "expected": "flag"},
        {"type": "small", "expected": "allow"}
    ]
    
    results = {}
    
    for test_case in test_cases:
        image_type = test_case["type"]
        expected = test_case["expected"]
        
        print(f"\n📸 Testing {image_type} image...")
        
        try:
            # Create test image
            filename = create_sample_image(image_type, f"test_{image_type}.jpg")
            
            # Read image file
            with open(filename, 'rb') as f:
                image_content = f.read()
            
            # Send to moderation endpoint
            files = {"file": (filename, image_content, "image/jpeg")}
            response = requests.post(f"{base_url}/moderate/image", files=files)
            
            if response.status_code == 200:
                result = response.json()
                action = result.get("moderation_action", "unknown")
                confidence = result.get("confidence", 0)
                categories = result.get("categories", {})
                reasons = result.get("flagged_reasons", [])
                
                status = "✅" if action == expected else "⚠️"
                print(f"{status} Result: {action} (expected: {expected})")
                print(f"   Confidence: {confidence:.2f}")
                print(f"   Categories: {list(categories.keys())}")
                print(f"   Reasons: {reasons}")
                
                results[image_type] = {
                    "success": True,
                    "action": action,
                    "expected": expected,
                    "confidence": confidence,
                    "categories": categories,
                    "reasons": reasons
                }
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                results[image_type] = {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
            
            # Clean up
            if os.path.exists(filename):
                os.remove(filename)
                
        except Exception as e:
            print(f"❌ Error: {e}")
            results[image_type] = {
                "success": False,
                "error": str(e)
            }
    
    return results

def test_video_moderation(base_url="http://localhost:8000"):
    """Test video moderation with various video types"""
    print("\n🎥 Testing Video Moderation")
    print("=" * 40)
    
    test_cases = [
        {"type": "normal", "duration": 3, "expected": "allow"},
        {"type": "skin_tone", "duration": 3, "expected": "flag"},
        {"type": "red_dominant", "duration": 3, "expected": "flag"},
        {"type": "long", "duration": 10, "expected": "flag"},
        {"type": "short", "duration": 1, "expected": "flag"}
    ]
    
    results = {}
    
    for test_case in test_cases:
        video_type = test_case["type"]
        duration = test_case["duration"]
        expected = test_case["expected"]
        
        print(f"\n🎬 Testing {video_type} video ({duration}s)...")
        
        try:
            # Create test video
            filename = create_sample_video(video_type, f"test_{video_type}.mp4", duration)
            
            if filename and os.path.exists(filename):
                # Read video file
                with open(filename, 'rb') as f:
                    video_content = f.read()
                
                # Send to moderation endpoint
                files = {"file": (filename, video_content, "video/mp4")}
                response = requests.post(f"{base_url}/moderate/video", files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    action = result.get("moderation_action", "unknown")
                    confidence = result.get("confidence", 0)
                    categories = result.get("categories", {})
                    reasons = result.get("flagged_reasons", [])
                    metadata = result.get("video_metadata", {})
                    
                    status = "✅" if action == expected else "⚠️"
                    print(f"{status} Result: {action} (expected: {expected})")
                    print(f"   Confidence: {confidence:.2f}")
                    print(f"   Categories: {list(categories.keys())}")
                    print(f"   Reasons: {reasons}")
                    if metadata:
                        print(f"   Duration: {metadata.get('duration', 'N/A')}s")
                        print(f"   Frames: {metadata.get('total_frames', 'N/A')}")
                    
                    results[video_type] = {
                        "success": True,
                        "action": action,
                        "expected": expected,
                        "confidence": confidence,
                        "categories": categories,
                        "reasons": reasons,
                        "metadata": metadata
                    }
                else:
                    print(f"❌ HTTP Error: {response.status_code}")
                    results[video_type] = {
                        "success": False,
                        "error": f"HTTP {response.status_code}"
                    }
                
                # Clean up
                os.remove(filename)
            else:
                print(f"❌ Could not create video file")
                results[video_type] = {
                    "success": False,
                    "error": "Could not create video file"
                }
                
        except Exception as e:
            print(f"❌ Error: {e}")
            results[video_type] = {
                "success": False,
                "error": str(e)
            }
    
    return results

def test_batch_moderation(base_url="http://localhost:8000"):
    """Test batch moderation with multiple content types"""
    print("\n📦 Testing Batch Moderation")
    print("=" * 40)
    
    try:
        # Create test content
        print("Creating test content...")
        image_file = create_sample_image("normal", "batch_test_image.jpg")
        video_file = create_sample_video("normal", "batch_test_video.mp4", 2)
        
        # Read files
        with open(image_file, 'rb') as f:
            image_content = f.read()
        with open(video_file, 'rb') as f:
            video_content = f.read()
        
        # Send batch request
        files = {
            "image_file": ("batch_test_image.jpg", image_content, "image/jpeg"),
            "video_file": ("batch_test_video.mp4", video_content, "video/mp4")
        }
        data = {"text_content": "This is a test question about programming"}
        
        print("Sending batch moderation request...")
        response = requests.post(f"{base_url}/moderate/batch", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            overall_decision = result.get("overall_decision", "unknown")
            results = result.get("results", {})
            
            print(f"✅ Batch moderation successful")
            print(f"   Overall decision: {overall_decision}")
            
            for content_type, content_result in results.items():
                action = content_result.get("moderation_action", "unknown")
                confidence = content_result.get("confidence", 0)
                print(f"   {content_type}: {action} (confidence: {confidence:.2f})")
            
            # Clean up
            os.remove(image_file)
            os.remove(video_file)
            
            return {
                "success": True,
                "overall_decision": overall_decision,
                "results": results
            }
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return {
                "success": False,
                "error": f"HTTP {response.status_code}"
            }
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def main():
    """Main function to run all tests"""
    print("🧪 Image and Video Moderation Test Suite")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Check if server is running
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code != 200:
            print(f"❌ Server not responding at {base_url}")
            print("Please start the moderation service first:")
            print("   cd moderation_service")
            print("   python app.py")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server at {base_url}")
        print("Please start the moderation service first:")
        print("   cd moderation_service")
        print("   python app.py")
        return
    
    print("✅ Server is running")
    
    # Run tests
    image_results = test_image_moderation(base_url)
    video_results = test_video_moderation(base_url)
    batch_results = test_batch_moderation(base_url)
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 50)
    
    # Image results
    image_success = sum(1 for r in image_results.values() if r.get("success", False))
    image_total = len(image_results)
    print(f"Image Moderation: {image_success}/{image_total} tests passed")
    
    # Video results
    video_success = sum(1 for r in video_results.values() if r.get("success", False))
    video_total = len(video_results)
    print(f"Video Moderation: {video_success}/{video_total} tests passed")
    
    # Batch results
    batch_success = batch_results.get("success", False)
    print(f"Batch Moderation: {'✅ PASS' if batch_success else '❌ FAIL'}")
    
    # Save results
    all_results = {
        "image_moderation": image_results,
        "video_moderation": video_results,
        "batch_moderation": batch_results
    }
    
    with open("image_video_test_results.json", "w") as f:
        json.dump(all_results, f, indent=2)
    
    print(f"\n📄 Results saved to image_video_test_results.json")
    print("\n🎉 Testing complete!")

if __name__ == "__main__":
    main() 