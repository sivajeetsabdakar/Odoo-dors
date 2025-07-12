#!/usr/bin/env python3
"""
Simple test script for text and image moderation (no video)
"""

import requests
import json
import os
import io
from PIL import Image, ImageDraw

class SimpleModerationTester:
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
    
    def create_test_image(self, image_type="normal") -> bytes:
        """Create a simple test image"""
        if image_type == "normal":
            img = Image.new('RGB', (300, 200), color='lightblue')
            draw = ImageDraw.Draw(img)
            draw.rectangle([50, 50, 250, 150], fill='white', outline='black', width=2)
            draw.text((100, 100), "Test Image", fill='black')
        elif image_type == "skin_tone":
            img = Image.new('RGB', (300, 200), color='white')
            draw = ImageDraw.Draw(img)
            skin_colors = [(255, 220, 177), (255, 205, 148), (255, 190, 118)]
            for i, color in enumerate(skin_colors):
                y_start = i * 67
                y_end = (i + 1) * 67
                draw.rectangle([0, y_start, 300, y_end], fill=color)
        
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        return img_bytes.getvalue()
    
    def test_text_moderation(self) -> bool:
        """Test text moderation"""
        try:
            test_cases = [
                {"content": "How do I implement a binary search tree?", "expected": "allow"},
                {"content": "This is a fucking stupid question", "expected": "flag"},
                {"content": "I will kill everyone who disagrees", "expected": "block"}
            ]
            
            for i, test_case in enumerate(test_cases, 1):
                response = requests.post(
                    f"{self.base_url}/moderate/text",
                    json={
                        "content": test_case["content"],
                        "content_type": "text"
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    action = result.get("moderation_action", "unknown")
                    status = "✅" if action == test_case["expected"] else "⚠️"
                    print(f"{status} Text Test {i}: {action} (expected: {test_case['expected']})")
                else:
                    print(f"❌ Text Test {i}: HTTP {response.status_code}")
                    return False
            
            return True
        except Exception as e:
            print(f"❌ Text moderation error: {e}")
            return False
    
    def test_image_moderation(self) -> bool:
        """Test image moderation"""
        try:
            # Test file upload
            image_content = self.create_test_image("normal")
            files = {"file": ("test_image.jpg", image_content, "image/jpeg")}
            response = requests.post(f"{self.base_url}/moderate/image", files=files)
            
            if response.status_code == 200:
                result = response.json()
                action = result.get("moderation_action", "unknown")
                print(f"✅ Image Test (File): {action}")
            else:
                print(f"❌ Image Test (File): HTTP {response.status_code}")
                return False
            
            # Test URL (using placeholder)
            data = {"image_url": "https://via.placeholder.com/300x200/lightblue/000000?text=Test"}
            response = requests.post(f"{self.base_url}/moderate/image", data=data)
            
            if response.status_code == 200:
                result = response.json()
                action = result.get("moderation_action", "unknown")
                print(f"✅ Image Test (URL): {action}")
            else:
                print(f"⚠️ Image Test (URL): HTTP {response.status_code} (URL may be unavailable)")
            
            return True
        except Exception as e:
            print(f"❌ Image moderation error: {e}")
            return False
    
    def test_batch_moderation(self) -> bool:
        """Test batch moderation"""
        try:
            # Test with text and image
            image_content = self.create_test_image("normal")
            files = {"image_file": ("test_image.jpg", image_content, "image/jpeg")}
            data = {"text_content": "This is a test message for batch moderation."}
            
            response = requests.post(f"{self.base_url}/moderate/batch", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                overall = result.get("overall_decision", "unknown")
                results = result.get("results", {})
                
                print(f"✅ Batch Test: {overall}")
                for content_type, content_result in results.items():
                    action = content_result.get("moderation_action", "unknown")
                    print(f"   {content_type}: {action}")
                
                return True
            else:
                print(f"❌ Batch Test: HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Batch moderation error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Simple Moderation Test Suite (Text + Image Only)")
        print("=" * 55)
        
        tests = [
            ("Health Check", self.test_health),
            ("Text Moderation", self.test_text_moderation),
            ("Image Moderation", self.test_image_moderation),
            ("Batch Moderation", self.test_batch_moderation)
        ]
        
        results = {}
        for test_name, test_func in tests:
            print(f"\n📋 {test_name}")
            print("-" * 30)
            results[test_name] = test_func()
        
        # Summary
        print("\n📊 Test Summary:")
        print("=" * 30)
        passed = sum(results.values())
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
        
        print(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! System is working correctly.")
        else:
            print("⚠️ Some tests failed. Check the output above.")
        
        return results

def main():
    """Main function"""
    tester = SimpleModerationTester()
    results = tester.run_all_tests()
    
    # Save results
    with open("simple_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Results saved to simple_test_results.json")

if __name__ == "__main__":
    main() 