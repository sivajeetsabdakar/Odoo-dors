from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any, Union
import uvicorn
import os
from dotenv import load_dotenv

from text_moderator import TextModerator
from image_moderator import ImageModerator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="StackIt Content Moderation API (Free Version)",
    description="AI-powered content moderation using only free and open-source tools",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize moderators
text_moderator = TextModerator()
image_moderator = ImageModerator()

class ModerationRequest(BaseModel):
    content: str
    content_type: str = "text"  # text, question, answer, comment

class ImageModerationRequest(BaseModel):
    image_url: Optional[HttpUrl] = None
    image_file: Optional[UploadFile] = None

class BatchModerationRequest(BaseModel):
    text_content: Optional[str] = None
    image_url: Optional[HttpUrl] = None

class ModerationResponse(BaseModel):
    is_appropriate: bool
    confidence: float
    categories: Dict[str, float]
    flagged_reasons: list
    moderation_action: str  # "allow", "flag", "block"

@app.get("/")
async def root():
    return {
        "message": "StackIt Content Moderation API (Free Version)",
        "version": "1.0.0",
        "features": [
            "Text moderation using Hugging Face models",
            "Image moderation using OpenCV and computer vision",
            "No paid APIs required - 100% free and open-source"
        ],
        "endpoints": {
            "moderate_text": "/moderate/text",
            "moderate_image": "/moderate/image",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "content_moderation",
        "version": "free",
        "models_loaded": {
            "text_moderator": text_moderator.toxicity_classifier is not None,
            "image_moderator": image_moderator.face_cascade is not None
        }
    }

@app.post("/moderate/text", response_model=ModerationResponse)
async def moderate_text(request: ModerationRequest):
    """
    Moderate text content using free Hugging Face models and custom patterns
    """
    try:
        result = await text_moderator.moderate(request.content, request.content_type)
        return ModerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text moderation failed: {str(e)}")

@app.post("/moderate/image")
async def moderate_image(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None)
):
    """
    Moderate image content using free computer vision techniques
    Accepts either uploaded file or image URL
    """
    try:
        if file:
            # Validate file type
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            
            # Read image content
            image_content = await file.read()
            result = await image_moderator.moderate(image_content)
            
        elif image_url:
            # Validate URL format
            if not (image_url.startswith('http://') or image_url.startswith('https://')):
                raise HTTPException(status_code=400, detail="Invalid image URL format")
            
            result = await image_moderator.moderate(image_url)
            
        else:
            raise HTTPException(status_code=400, detail="Either file or image_url must be provided")
        
        return ModerationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image moderation failed: {str(e)}")



@app.post("/moderate/batch")
async def moderate_batch(
    text_content: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None)
):
    """
    Moderate multiple content types in a single request
    Accepts files and/or URLs for image content
    """
    results = {}
    
    try:
        # Moderate text if provided
        if text_content:
            text_result = await text_moderator.moderate(text_content, "text")
            results["text"] = text_result
        
        # Moderate image if provided (file or URL)
        if image_file:
            image_content = await image_file.read()
            image_result = await image_moderator.moderate(image_content)
            results["image"] = image_result
        elif image_url:
            image_result = await image_moderator.moderate(image_url)
            results["image"] = image_result
        
        return {
            "results": results,
            "overall_decision": "block" if any(r.get("is_appropriate") == False for r in results.values()) else "allow"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch moderation failed: {str(e)}")

@app.get("/info")
async def get_info():
    """
    Get information about the moderation service and its capabilities
    """
    return {
        "service_name": "StackIt Content Moderation API",
        "version": "1.0.0 (Free Version)",
        "description": "AI-powered content moderation using only free and open-source tools",
        "features": {
            "text_moderation": {
                "models": ["Hugging Face Toxic-BERT", "Sentiment Analysis", "Custom Patterns"],
                "capabilities": ["Profanity", "Hate Speech", "Threats", "Spam", "Sentiment Analysis"]
            },
            "image_moderation": {
                "models": ["OpenCV Cascade Classifiers", "Color Analysis", "Texture Analysis"],
                "capabilities": ["Skin Tone Detection", "Object Detection", "Color Analysis", "Size Validation"]
            },

        },
        "cost": "Free - No paid APIs required",
        "technologies": [
            "FastAPI", "Hugging Face Transformers", "OpenCV", "PIL", "NLTK", "TextBlob"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 