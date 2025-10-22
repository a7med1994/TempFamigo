from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# ==================== MODELS ====================

class Venue(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    category: str  # Indoor, Outdoor, Farm, Playground, Circus, Learning, Free
    location: dict  # {address, city, coordinates: {lat, lng}}
    images: List[str] = []  # base64 images
    pricing: dict  # {type: 'free' | 'paid', amount: number, currency: 'AUD'}
    facilities: List[str] = []  # ["Parking", "Cafe", "Toilets"]
    age_range: dict  # {min: 0, max: 12}
    rating: float = 0.0
    total_reviews: int = 0
    contact: dict = {}  # {phone, email, website}
    business_owner_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = False

class VenueCreate(BaseModel):
    name: str
    description: str
    category: str
    location: dict
    images: List[str] = []
    pricing: dict
    facilities: List[str] = []
    age_range: dict
    contact: dict = {}

class Event(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    event_type: str  # 'playdate' | 'venue_event'
    date: datetime
    location: dict  # {address, city, coordinates: {lat, lng}}
    host_id: str
    host_name: str
    age_range: dict  # {min: 0, max: 12}
    max_participants: int
    current_participants: int = 0
    is_public: bool = True
    images: List[str] = []
    venue_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str
    date: datetime
    location: dict
    host_id: str
    host_name: str
    age_range: dict
    max_participants: int
    is_public: bool = True
    images: List[str] = []
    venue_id: Optional[str] = None

class RSVP(BaseModel):
    id: Optional[str] = None
    event_id: str
    user_id: str
    user_name: str
    status: str  # 'accepted' | 'declined' | 'maybe'
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Review(BaseModel):
    id: Optional[str] = None
    venue_id: Optional[str] = None
    event_id: Optional[str] = None
    user_id: str
    user_name: str
    rating: int  # 1-5
    comment: str
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(BaseModel):
    venue_id: Optional[str] = None
    event_id: Optional[str] = None
    user_id: str
    user_name: str
    rating: int
    comment: str
    images: List[str] = []

class Booking(BaseModel):
    id: Optional[str] = None
    user_id: str
    user_name: str
    venue_id: Optional[str] = None
    event_id: Optional[str] = None
    date: datetime
    status: str  # 'pending' | 'confirmed' | 'cancelled'
    payment_status: str  # 'pending' | 'paid' | 'refunded'
    amount: float
    ticket_code: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    user_id: str
    user_name: str
    venue_id: Optional[str] = None
    event_id: Optional[str] = None
    date: datetime
    amount: float

class Post(BaseModel):
    id: Optional[str] = None
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    post_type: str  # 'photo_share' | 'event_announcement' | 'recommendation' | 'invitation' | 'status'
    content: str
    images: List[str] = []
    related_venue_id: Optional[str] = None
    related_event_id: Optional[str] = None
    is_public: bool = True
    likes: int = 0
    comment_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    post_type: str
    content: str
    images: List[str] = []
    related_venue_id: Optional[str] = None
    related_event_id: Optional[str] = None
    is_public: bool = True

class Comment(BaseModel):
    id: Optional[str] = None
    post_id: str
    user_id: str
    user_name: str
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    post_id: str
    user_id: str
    user_name: str
    comment: str

class Reaction(BaseModel):
    id: Optional[str] = None
    post_id: str
    user_id: str
    user_name: str
    reaction_type: str  # 'like' | 'love' | 'celebrate' | 'support'
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== VENUE ENDPOINTS ====================

@api_router.post("/venues", response_model=Venue)
async def create_venue(venue: VenueCreate):
    venue_dict = venue.dict()
    venue_dict["created_at"] = datetime.utcnow()
    venue_dict["rating"] = 0.0
    venue_dict["total_reviews"] = 0
    venue_dict["is_verified"] = False
    
    result = await db.venues.insert_one(venue_dict)
    venue_dict["id"] = str(result.inserted_id)
    return Venue(**venue_dict)

@api_router.get("/venues", response_model=List[Venue])
async def get_venues(
    category: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    price_type: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    
    if category:
        query["category"] = category
    
    if min_age is not None or max_age is not None:
        age_query = {}
        if min_age is not None:
            age_query["age_range.max"] = {"$gte": min_age}
        if max_age is not None:
            age_query["age_range.min"] = {"$lte": max_age}
        query.update(age_query)
    
    if price_type:
        query["pricing.type"] = price_type
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    venues = await db.venues.find(query).to_list(100)
    return [Venue(**serialize_doc(v)) for v in venues]

@api_router.get("/venues/{venue_id}", response_model=Venue)
async def get_venue(venue_id: str):
    venue = await db.venues.find_one({"_id": ObjectId(venue_id)})
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return Venue(**serialize_doc(venue))

@api_router.get("/venues/nearby/search")
async def get_nearby_venues(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(50.0)  # km
):
    # Simple distance calculation (for MVP, in production use MongoDB geospatial queries)
    venues = await db.venues.find().to_list(100)
    nearby_venues = []
    
    for venue in venues:
        if "coordinates" in venue.get("location", {}):
            venue_lat = venue["location"]["coordinates"]["lat"]
            venue_lng = venue["location"]["coordinates"]["lng"]
            
            # Simple distance calculation (not accurate for large distances)
            distance = ((lat - venue_lat) ** 2 + (lng - venue_lng) ** 2) ** 0.5 * 111  # km
            
            if distance <= radius:
                venue["distance"] = round(distance, 2)
                nearby_venues.append(Venue(**serialize_doc(venue)))
    
    return sorted(nearby_venues, key=lambda x: x.dict().get("distance", 999))

# ==================== AI RECOMMENDATIONS ====================

@api_router.post("/recommendations")
async def get_recommendations(request: dict):
    """
    Get AI-powered activity recommendations
    Request: {user_location: {city, coordinates}, kids_ages: [3, 7], weather: 'sunny', time_of_day: 'morning'}
    """
    try:
        # Get all venues
        venues = await db.venues.find().to_list(100)
        
        # Prepare context for LLM
        venues_summary = []
        for v in venues[:10]:  # Limit to 10 for token efficiency
            venues_summary.append({
                "name": v.get("name"),
                "category": v.get("category"),
                "description": v.get("description", "")[:100],
                "age_range": v.get("age_range"),
                "pricing": v.get("pricing"),
                "rating": v.get("rating"),
                "id": str(v.get("_id"))
            })
        
        # Create LLM chat
        llm_key = os.getenv("EMERGENT_LLM_KEY")
        chat = LlmChat(
            api_key=llm_key,
            session_id="famigo-recommendations",
            system_message="You are a helpful family activity recommendation assistant for Famigo app. Recommend the best activities based on user context."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create recommendation prompt
        user_msg = f"""
        User Context:
        - Location: {request.get('user_location', {}).get('city', 'Unknown')}
        - Kids Ages: {request.get('kids_ages', [])}
        - Weather: {request.get('weather', 'unknown')}
        - Time: {request.get('time_of_day', 'unknown')}
        
        Available Venues:
        {json.dumps(venues_summary, indent=2)}
        
        Please recommend top 3 activities from the available venues. Consider:
        1. Age appropriateness for the kids
        2. Weather conditions (indoor for rain, outdoor for sunshine)
        3. Time of day
        4. Ratings and reviews
        
        Return ONLY a JSON array with this structure:
        [{{
            "venue_id": "id",
            "reason": "brief explanation why this is good for them"
        }}]
        """
        
        message = UserMessage(text=user_msg)
        response = await chat.send_message(message)
        
        # Parse response
        try:
            recommendations = json.loads(response)
            return {"recommendations": recommendations, "context": request}
        except:
            return {"recommendations": [], "raw_response": response}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

# ==================== EVENT ENDPOINTS ====================

@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate):
    event_dict = event.dict()
    event_dict["current_participants"] = 0
    event_dict["created_at"] = datetime.utcnow()
    
    result = await db.events.insert_one(event_dict)
    event_dict["id"] = str(result.inserted_id)
    return Event(**event_dict)

@api_router.get("/events", response_model=List[Event])
async def get_events(
    event_type: Optional[str] = None,
    is_public: Optional[bool] = None,
    host_id: Optional[str] = None
):
    query = {}
    
    if event_type:
        query["event_type"] = event_type
    if is_public is not None:
        query["is_public"] = is_public
    if host_id:
        query["host_id"] = host_id
    
    events = await db.events.find(query).sort("date", 1).to_list(100)
    return [Event(**serialize_doc(e)) for e in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**serialize_doc(event))

@api_router.post("/events/{event_id}/rsvp")
async def rsvp_event(event_id: str, rsvp: dict):
    # Check if already RSVP'd
    existing = await db.rsvps.find_one({"event_id": event_id, "user_id": rsvp["user_id"]})
    
    if existing:
        # Update existing RSVP
        await db.rsvps.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": rsvp["status"]}}
        )
    else:
        # Create new RSVP
        rsvp_doc = {
            "event_id": event_id,
            "user_id": rsvp["user_id"],
            "user_name": rsvp["user_name"],
            "status": rsvp["status"],
            "created_at": datetime.utcnow()
        }
        await db.rsvps.insert_one(rsvp_doc)
    
    # Update event participant count
    if rsvp["status"] == "accepted":
        accepted_count = await db.rsvps.count_documents({"event_id": event_id, "status": "accepted"})
        await db.events.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": {"current_participants": accepted_count}}
        )
    
    return {"success": True, "message": "RSVP updated"}

@api_router.get("/events/{event_id}/attendees")
async def get_event_attendees(event_id: str):
    rsvps = await db.rsvps.find({"event_id": event_id, "status": "accepted"}).to_list(100)
    return [serialize_doc(r) for r in rsvps]

# ==================== REVIEW ENDPOINTS ====================

@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    review_dict = review.dict()
    review_dict["created_at"] = datetime.utcnow()
    
    result = await db.reviews.insert_one(review_dict)
    review_dict["id"] = str(result.inserted_id)
    
    # Update venue rating
    if review.venue_id:
        reviews = await db.reviews.find({"venue_id": review.venue_id}).to_list(1000)
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
        await db.venues.update_one(
            {"_id": ObjectId(review.venue_id)},
            {"$set": {"rating": round(avg_rating, 1), "total_reviews": len(reviews)}}
        )
    
    return Review(**review_dict)

@api_router.get("/reviews/venue/{venue_id}", response_model=List[Review])
async def get_venue_reviews(venue_id: str):
    reviews = await db.reviews.find({"venue_id": venue_id}).sort("created_at", -1).to_list(100)
    return [Review(**serialize_doc(r)) for r in reviews]

# ==================== BOOKING ENDPOINTS ====================

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking: BookingCreate):
    import uuid
    
    booking_dict = booking.dict()
    booking_dict["status"] = "pending"
    booking_dict["payment_status"] = "pending"
    booking_dict["ticket_code"] = str(uuid.uuid4())[:8].upper()
    booking_dict["created_at"] = datetime.utcnow()
    
    result = await db.bookings.insert_one(booking_dict)
    booking_dict["id"] = str(result.inserted_id)
    return Booking(**booking_dict)

@api_router.get("/bookings/user/{user_id}", response_model=List[Booking])
async def get_user_bookings(user_id: str):
    bookings = await db.bookings.find({"user_id": user_id}).sort("date", -1).to_list(100)
    return [Booking(**serialize_doc(b)) for b in bookings]

@api_router.put("/bookings/{booking_id}/confirm")
async def confirm_booking(booking_id: str):
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "confirmed", "payment_status": "paid"}}
    )
    return {"success": True}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Famigo API - Discover. Connect. Play."}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()