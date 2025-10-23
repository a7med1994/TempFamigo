import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Seeding database with sample data...")
    
    # Clear existing data
    await db.venues.delete_many({})
    await db.events.delete_many({})
    await db.reviews.delete_many({})
    
    # Sample Venues
    venues = [
        {
            "name": "Sunshine Indoor Play Centre",
            "description": "A magical indoor play space with soft play areas, climbing walls, trampolines, and a dedicated toddler zone. Perfect for rainy days!",
            "category": "Indoor",
            "location": {
                "address": "123 Play Street",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8136, "lng": 144.9631}
            },
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "pricing": {"type": "paid", "amount": 15, "currency": "AUD"},
            "facilities": ["Parking", "Cafe", "Toilets", "Air Conditioning"],
            "age_range": {"min": 1, "max": 10},
            "rating": 4.5,
            "total_reviews": 24,
            "contact": {"phone": "03 1234 5678", "email": "info@sunshineplay.com.au"},
            "is_verified": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Adventure Park Melbourne",
            "description": "Large outdoor adventure park with zip lines, obstacle courses, nature trails, and picnic areas. Great for active families!",
            "category": "Outdoor",
            "location": {
                "address": "456 Nature Road",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8230, "lng": 144.9750}
            },
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "pricing": {"type": "paid", "amount": 25, "currency": "AUD"},
            "facilities": ["Parking", "BBQ Areas", "Toilets", "First Aid"],
            "age_range": {"min": 5, "max": 12},
            "rating": 4.8,
            "total_reviews": 45,
            "contact": {"phone": "03 2345 6789", "email": "info@adventurepark.com.au"},
            "is_verified": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Happy Farm Experience",
            "description": "Interact with farm animals, go on tractor rides, and learn about farming. Educational and fun for all ages!",
            "category": "Farm",
            "location": {
                "address": "789 Farm Lane",
                "city": "Craigieburn",
                "coordinates": {"lat": -37.6000, "lng": 144.9400}
            },
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "pricing": {"type": "paid", "amount": 20, "currency": "AUD"},
            "facilities": ["Parking", "Cafe", "Toilets", "Picnic Areas", "Animal Feeding"],
            "age_range": {"min": 2, "max": 12},
            "rating": 4.7,
            "total_reviews": 38,
            "contact": {"phone": "03 3456 7890", "email": "hello@happyfarm.com.au"},
            "is_verified": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Wonder Playground",
            "description": "Modern public playground with slides, swings, climbing frames, and a water play area. Free entry for all!",
            "category": "Playground",
            "location": {
                "address": "Central Park",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8100, "lng": 144.9600}
            },
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "pricing": {"type": "free", "amount": 0, "currency": "AUD"},
            "facilities": ["Toilets", "Water Fountain", "Shade Areas"],
            "age_range": {"min": 2, "max": 10},
            "rating": 4.3,
            "total_reviews": 67,
            "contact": {},
            "is_verified": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Kids Science Discovery Centre",
            "description": "Interactive science museum with hands-on experiments, workshops, and educational programs. Spark curiosity and learning!",
            "category": "Learning",
            "location": {
                "address": "101 Education Avenue",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8200, "lng": 144.9500}
            },
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "pricing": {"type": "paid", "amount": 18, "currency": "AUD"},
            "facilities": ["Parking", "Cafe", "Toilets", "Gift Shop"],
            "age_range": {"min": 4, "max": 12},
            "rating": 4.6,
            "total_reviews": 52,
            "contact": {"phone": "03 4567 8901", "email": "learn@sciencekids.com.au"},
            "is_verified": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Riverside Walking Trail",
            "description": "Scenic walking and cycling trail along the river. Great for family picnics and outdoor activities. Free access!",
            "category": "Free",
            "location": {
                "address": "Riverside Parkway",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8180, "lng": 144.9550}
            },
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "pricing": {"type": "free", "amount": 0, "currency": "AUD"},
            "facilities": ["Parking", "Toilets", "BBQ Areas", "Bike Rental"],
            "age_range": {"min": 0, "max": 12},
            "rating": 4.4,
            "total_reviews": 89,
            "contact": {},
            "is_verified": True,
            "created_at": datetime.utcnow()
        },
    ]
    
    result = await db.venues.insert_many(venues)
    venue_ids = [str(id) for id in result.inserted_ids]
    print(f"✓ Created {len(venues)} venues")
    
    # Sample Events
    tomorrow = datetime.utcnow() + timedelta(days=1)
    next_week = datetime.utcnow() + timedelta(days=7)
    
    events = [
        {
            "title": "Saturday Morning Playdate at the Park",
            "description": "Join us for a fun morning playdate at Wonder Playground! Bring snacks and toys to share.",
            "event_type": "playdate",
            "date": tomorrow.replace(hour=10, minute=0),
            "location": {
                "address": "Central Park",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8100, "lng": 144.9600}
            },
            "host_id": "parent_001",
            "host_name": "Sarah Johnson",
            "age_range": {"min": 3, "max": 8},
            "max_participants": 15,
            "current_participants": 5,
            "is_public": True,
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "created_at": datetime.utcnow()
        },
        {
            "title": "Farm Tour & Animal Feeding",
            "description": "Special guided farm tour with hands-on animal feeding experience. Educational and fun!",
            "event_type": "venue_event",
            "date": next_week.replace(hour=14, minute=0),
            "location": {
                "address": "789 Farm Lane",
                "city": "Craigieburn",
                "coordinates": {"lat": -37.6000, "lng": 144.9400}
            },
            "host_id": "venue_003",
            "host_name": "Happy Farm Experience",
            "age_range": {"min": 2, "max": 12},
            "max_participants": 30,
            "current_participants": 12,
            "is_public": True,
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "venue_id": venue_ids[2] if len(venue_ids) > 2 else None,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Science Workshop: Volcanoes!",
            "description": "Kids will create their own erupting volcanoes and learn about geology. Book now!",
            "event_type": "venue_event",
            "date": (datetime.utcnow() + timedelta(days=5)).replace(hour=11, minute=0),
            "location": {
                "address": "101 Education Avenue",
                "city": "Melbourne",
                "coordinates": {"lat": -37.8200, "lng": 144.9500}
            },
            "host_id": "venue_005",
            "host_name": "Kids Science Discovery Centre",
            "age_range": {"min": 6, "max": 12},
            "max_participants": 20,
            "current_participants": 8,
            "is_public": True,
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "venue_id": venue_ids[4] if len(venue_ids) > 4 else None,
            "created_at": datetime.utcnow()
        },
    ]
    
    await db.events.insert_many(events)
    print(f"✓ Created {len(events)} events")
    
    # Sample Reviews
    reviews = [
        {
            "venue_id": venue_ids[0],
            "user_id": "user_001",
            "user_name": "Emily Watson",
            "rating": 5,
            "comment": "Absolutely loved it! My kids had a blast and the staff were so friendly. Highly recommend!",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "created_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "venue_id": venue_ids[1],
            "user_id": "user_002",
            "user_name": "Michael Chen",
            "rating": 5,
            "comment": "Amazing outdoor adventure! The zip line was the highlight. Great value for money.",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "created_at": datetime.utcnow() - timedelta(days=3)
        },
        {
            "venue_id": venue_ids[2],
            "user_id": "user_003",
            "user_name": "Lisa Brown",
            "rating": 4,
            "comment": "Really nice farm experience. Kids loved feeding the animals. Could use more shade areas though.",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "created_at": datetime.utcnow() - timedelta(days=1)
        },
    ]
    
    await db.reviews.insert_many(reviews)
    print(f"✓ Created {len(reviews)} reviews")
    
    # Sample Social Feed Posts
    posts = [
        {
            "user_id": "user_001",
            "user_name": "Anita J.",
            "user_avatar": None,
            "post_type": "photo_share",
            "content": "What an amazing day at Sunshine Indoor Play Centre! The kids had so much fun on the trampolines and climbing walls. Highly recommend for a rainy day activity! 🎉",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "related_venue_id": venue_ids[0] if len(venue_ids) > 0 else None,
            "is_public": True,
            "likes": 24,
            "comment_count": 5,
            "created_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "user_id": "user_002",
            "user_name": "Sarah M.",
            "user_avatar": None,
            "post_type": "event_announcement",
            "content": "Super excited about the upcoming Science Workshop: Volcanoes! 🌋 My kids have been asking about volcanoes non-stop. Who else is joining?",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "related_event_id": venue_ids[4] if len(venue_ids) > 4 else None,
            "is_public": True,
            "likes": 18,
            "comment_count": 7,
            "created_at": datetime.utcnow() - timedelta(hours=5)
        },
        {
            "user_id": "user_003",
            "user_name": "Norah H.",
            "user_avatar": None,
            "post_type": "recommendation",
            "content": "Just discovered Wonder Playground and it's fantastic! 🎈 The water play area is perfect for hot days, and best of all - it's completely FREE! Great for ages 2-10.",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "related_venue_id": venue_ids[3] if len(venue_ids) > 3 else None,
            "is_public": True,
            "likes": 42,
            "comment_count": 12,
            "created_at": datetime.utcnow() - timedelta(hours=8)
        },
        {
            "user_id": "user_004",
            "user_name": "Debby K.",
            "user_avatar": None,
            "post_type": "invitation",
            "content": "Hey Melbourne mums! 👋 I'm organizing a playgroup meet-up this Saturday at Wonder Playground, 10 AM. Bringing snacks and coffee! Kids ages 3-7 welcome. Comment if you'd like to join!",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "is_public": True,
            "likes": 31,
            "comment_count": 15,
            "created_at": datetime.utcnow() - timedelta(hours=12)
        },
        {
            "user_id": "user_005",
            "user_name": "Emma T.",
            "user_avatar": None,
            "post_type": "photo_share",
            "content": "Farm day was incredible! 🐄🐷 The kids loved feeding the animals and the tractor ride was the highlight. Thank you Happy Farm Experience for an educational and fun day!",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "related_venue_id": venue_ids[2] if len(venue_ids) > 2 else None,
            "is_public": True,
            "likes": 56,
            "comment_count": 9,
            "created_at": datetime.utcnow() - timedelta(hours=18)
        },
        {
            "user_id": "user_006",
            "user_name": "Lisa P.",
            "user_avatar": None,
            "post_type": "status",
            "content": "Looking for outdoor activity recommendations for this weekend! Preferably something with shade as it's going to be hot. Any suggestions for kids aged 5 and 8? 🌞",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "is_public": True,
            "likes": 11,
            "comment_count": 18,
            "created_at": datetime.utcnow() - timedelta(hours=3)
        },
        {
            "user_id": "user_007",
            "user_name": "Rachel W.",
            "user_avatar": None,
            "post_type": "event_announcement",
            "content": "Don't miss the Farm Tour & Animal Feeding event next week! 🐑 It's perfect for younger kids who want hands-on experience with farm animals. Booking now!",
            "images": ["https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800"],
            "image": "https://images.unsplash.com/photo-1587616211892-579fcd995315?w=800",
            "is_public": True,
            "likes": 27,
            "comment_count": 6,
            "created_at": datetime.utcnow() - timedelta(hours=24)
        },
    ]
    
    await db.posts.insert_many(posts)
    print(f"✓ Created {len(posts)} social feed posts")
    
    print("\n✅ Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
