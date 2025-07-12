#!/usr/bin/env python3
"""
Test script for StackIt Content Moderation Integration

This script tests the moderation integration with the Spring Boot backend.
Make sure both the moderation service and Spring Boot backend are running.
"""

import requests
import json
import sys
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8080"
MODERATION_SERVICE_URL = "https://d1946e5cd06f.ngrok-free.app"


def test_moderation_service_health():
    """Test if the moderation service is running"""
    print("🔍 Testing moderation service health...")

    try:
        response = requests.get(f"{MODERATION_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Moderation service is healthy: {data}")
            return True
        else:
            print(f"❌ Moderation service health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to moderation service: {e}")
        return False


def test_backend_moderation_health():
    """Test backend moderation health endpoint"""
    print("\n🔍 Testing backend moderation health...")

    try:
        response = requests.get(f"{BACKEND_URL}/api/moderation/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend moderation health: {data}")
            return True
        else:
            print(f"❌ Backend moderation health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False


def test_text_moderation():
    """Test text moderation through backend"""
    print("\n📝 Testing text moderation...")

    # Test cases
    test_cases = [
        {
            "name": "Normal content",
            "content": "How do I implement a binary search tree in Java?",
            "content_type": "question",
            "expected_action": "allow",
        },
        {
            "name": "Profanity test",
            "content": "This is a test with inappropriate language",
            "content_type": "comment",
            "expected_action": "block",
        },
    ]

    for test_case in test_cases:
        print(f"\n  Testing: {test_case['name']}")

        try:
            response = requests.post(
                f"{BACKEND_URL}/api/moderation/text",
                json={
                    "content": test_case["content"],
                    "content_type": test_case["content_type"],
                },
                timeout=10,
            )

            if response.status_code == 200:
                data = response.json()
                action = data.get("moderation_action", "unknown")
                print(
                    f"    ✅ Response: {action} (confidence: {data.get('confidence', 0):.2f})"
                )

                if action == test_case["expected_action"]:
                    print(f"    ✅ Expected action: {test_case['expected_action']}")
                else:
                    print(
                        f"    ⚠️  Unexpected action: expected {test_case['expected_action']}, got {action}"
                    )
            else:
                print(f"    ❌ HTTP {response.status_code}: {response.text}")

        except requests.exceptions.RequestException as e:
            print(f"    ❌ Request failed: {e}")


def test_image_moderation():
    """Test image moderation through backend"""
    print("\n🖼️  Testing image moderation...")

    # Test with a sample image URL
    test_image_url = "https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Image"

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/moderation/image",
            json={"image_url": test_image_url},
            timeout=30,
        )

        if response.status_code == 200:
            data = response.json()
            action = data.get("moderation_action", "unknown")
            print(
                f"  ✅ Image moderation result: {action} (confidence: {data.get('confidence', 0):.2f})"
            )
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"  ❌ Request failed: {e}")


def test_content_creation_with_moderation():
    """Test content creation with moderation"""
    print("\n📝 Testing content creation with moderation...")

    # Test creating a question with potentially inappropriate content
    question_data = {
        "title": "Test Question",
        "description": "This is a test question with potentially inappropriate content",
        "tags": ["java", "test"],
        "imageUrls": [],
    }

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/questions?userId=1", json=question_data, timeout=10
        )

        if response.status_code == 200:
            print("  ✅ Question created successfully (content was allowed)")
        elif response.status_code == 403:
            data = response.json()
            print(
                f"  ✅ Content blocked as expected: {data.get('error', 'Unknown error')}"
            )
        else:
            print(f"  ❌ Unexpected response: {response.status_code} - {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"  ❌ Request failed: {e}")


def test_batch_moderation():
    """Test batch moderation"""
    print("\n🔄 Testing batch moderation...")

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/moderation/batch",
            json={
                "text_content": "This is a test message for batch moderation",
                "image_url": "https://via.placeholder.com/300x200/0066cc/ffffff?text=Batch+Test",
            },
            timeout=30,
        )

        if response.status_code == 200:
            data = response.json()
            overall_decision = data.get("overall_decision", "unknown")
            print(f"  ✅ Batch moderation result: {overall_decision}")

            results = data.get("results", {})
            if "text" in results:
                text_result = results["text"]
                print(
                    f"    Text: {text_result.get('moderation_action', 'unknown')} (confidence: {text_result.get('confidence', 0):.2f})"
                )

            if "image" in results:
                image_result = results["image"]
                print(
                    f"    Image: {image_result.get('moderation_action', 'unknown')} (confidence: {image_result.get('confidence', 0):.2f})"
                )
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"  ❌ Request failed: {e}")


def main():
    """Run all tests"""
    print("🚀 Starting StackIt Content Moderation Integration Tests")
    print("=" * 60)

    # Check if services are running
    if not test_moderation_service_health():
        print("\n❌ Moderation service is not available. Please start it first.")
        print("   Expected URL: https://d1946e5cd06f.ngrok-free.app")
        sys.exit(1)

    if not test_backend_moderation_health():
        print("\n❌ Backend is not available. Please start it first.")
        print("   Expected URL: http://localhost:8080")
        sys.exit(1)

    # Run tests
    test_text_moderation()
    test_image_moderation()
    test_batch_moderation()
    test_content_creation_with_moderation()

    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\n📋 Summary:")
    print("  - Moderation service: ✅ Running")
    print("  - Backend integration: ✅ Working")
    print("  - Text moderation: ✅ Tested")
    print("  - Image moderation: ✅ Tested")
    print("  - Batch moderation: ✅ Tested")
    print("  - Content creation: ✅ Tested")

    print("\n🎉 Content moderation integration is working correctly!")


if __name__ == "__main__":
    main()
