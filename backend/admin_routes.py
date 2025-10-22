from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os

admin_router = APIRouter(prefix="/admin")

# Simple auth - in production, use proper authentication
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

def verify_admin(password: str):
    if password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Helper function
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# ==================== THEME/COLORS MANAGEMENT ====================

class ThemeConfig(BaseModel):
    primary_color: str = "#6D9773"
    text_color: str = "#0C3B2E"
    icon_color: str = "#BB8A52"
    accent_color: str = "#FFBA00"
    background_color: str = "#F9FAFB"

@admin_router.post("/theme")
async def update_theme(theme: ThemeConfig, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    theme_dict = theme.dict()
    theme_dict["updated_at"] = datetime.utcnow()
    
    await db.settings.update_one(
        {"type": "theme"},
        {"$set": theme_dict},
        upsert=True
    )
    
    return {"success": True, "theme": theme_dict}

@admin_router.get("/theme")
async def get_theme(password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    theme = await db.settings.find_one({"type": "theme"})
    if theme:
        return ThemeConfig(**serialize_doc(theme))
    return ThemeConfig()

# ==================== CATEGORIES MANAGEMENT ====================

class Category(BaseModel):
    id: Optional[str] = None
    name: str
    icon: str
    color: str
    description: str
    is_active: bool = True

@admin_router.get("/categories")
async def get_all_categories(password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    categories = await db.categories.find().to_list(100)
    return [Category(**serialize_doc(c)) for c in categories]

@admin_router.post("/categories")
async def create_category(category: Category, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    category_dict = category.dict(exclude={"id"})
    category_dict["created_at"] = datetime.utcnow()
    
    result = await db.categories.insert_one(category_dict)
    category_dict["id"] = str(result.inserted_id)
    return Category(**category_dict)

@admin_router.put("/categories/{category_id}")
async def update_category(category_id: str, category: Category, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    category_dict = category.dict(exclude={"id"})
    category_dict["updated_at"] = datetime.utcnow()
    
    await db.categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": category_dict}
    )
    return {"success": True}

@admin_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    await db.categories.delete_one({"_id": ObjectId(category_id)})
    return {"success": True}

# ==================== CONTENT MANAGEMENT ====================

@admin_router.get("/stats")
async def get_stats(password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    stats = {
        "total_venues": await db.venues.count_documents({}),
        "total_events": await db.events.count_documents({}),
        "total_posts": await db.posts.count_documents({}),
        "total_users": await db.users.count_documents({}),
        "total_bookings": await db.bookings.count_documents({}),
        "total_reviews": await db.reviews.count_documents({}),
        "public_events": await db.events.count_documents({"is_public": True}),
        "private_events": await db.events.count_documents({"is_public": False}),
    }
    return stats

@admin_router.get("/venues/all")
async def get_all_venues_admin(password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    venues = await db.venues.find().to_list(1000)
    return [serialize_doc(v) for v in venues]

@admin_router.delete("/venues/{venue_id}")
async def delete_venue(venue_id: str, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    await db.venues.delete_one({"_id": ObjectId(venue_id)})
    return {"success": True}

@admin_router.get("/events/all")
async def get_all_events_admin(password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    events = await db.events.find().to_list(1000)
    return [serialize_doc(e) for e in events]

@admin_router.delete("/events/{event_id}")
async def delete_event(event_id: str, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    await db.events.delete_one({"_id": ObjectId(event_id)})
    return {"success": True}

@admin_router.get("/posts/all")
async def get_all_posts_admin(password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    posts = await db.posts.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(p) for p in posts]

@admin_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    await db.posts.delete_one({"_id": ObjectId(post_id)})
    return {"success": True}

@admin_router.put("/posts/{post_id}/hide")
async def hide_post(post_id: str, password: str):
    verify_admin(password)
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"is_public": False, "moderated": True}}
    )
    return {"success": True}
