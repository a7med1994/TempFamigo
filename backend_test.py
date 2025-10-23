#!/usr/bin/env python3
"""
Famigo Backend API Testing Suite
Tests all backend APIs for the family activity discovery platform
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://totsu-family.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing Famigo Backend APIs at: {API_BASE}")

class FamigoAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = {
            'venue_apis': {'passed': 0, 'failed': 0, 'errors': []},
            'ai_recommendations': {'passed': 0, 'failed': 0, 'errors': []},
            'event_apis': {'passed': 0, 'failed': 0, 'errors': []},
            'review_apis': {'passed': 0, 'failed': 0, 'errors': []},
            'booking_apis': {'passed': 0, 'failed': 0, 'errors': []}
        }
        
        # Test data
        self.test_user_id = str(uuid.uuid4())
        self.test_venue_id = None
        self.test_event_id = None
        self.test_booking_id = None

    def log_result(self, category: str, test_name: str, success: bool, error: str = None):
        """Log test result"""
        if success:
            self.test_results[category]['passed'] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]['failed'] += 1
            self.test_results[category]['errors'].append(f"{test_name}: {error}")
            print(f"❌ {test_name}: {error}")

    def test_venue_apis(self):
        """Test all venue-related APIs"""
        print("\n🏢 Testing Venue APIs...")
        
        # Test 1: Get all venues
        try:
            response = self.session.get(f"{API_BASE}/venues")
            if response.status_code == 200:
                venues = response.json()
                if isinstance(venues, list) and len(venues) > 0:
                    self.test_venue_id = venues[0]['id']  # Store for later tests
                    self.log_result('venue_apis', 'GET /venues - List all venues', True)
                else:
                    self.log_result('venue_apis', 'GET /venues - List all venues', False, "No venues returned")
            else:
                self.log_result('venue_apis', 'GET /venues - List all venues', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('venue_apis', 'GET /venues - List all venues', False, str(e))

        # Test 2: Get venues with filters
        try:
            response = self.session.get(f"{API_BASE}/venues?category=Indoor&min_age=3&max_age=10")
            if response.status_code == 200:
                venues = response.json()
                self.log_result('venue_apis', 'GET /venues with filters', True)
            else:
                self.log_result('venue_apis', 'GET /venues with filters', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('venue_apis', 'GET /venues with filters', False, str(e))

        # Test 3: Search venues
        try:
            response = self.session.get(f"{API_BASE}/venues?search=playground")
            if response.status_code == 200:
                venues = response.json()
                self.log_result('venue_apis', 'GET /venues with search', True)
            else:
                self.log_result('venue_apis', 'GET /venues with search', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('venue_apis', 'GET /venues with search', False, str(e))

        # Test 4: Get single venue by ID
        if self.test_venue_id:
            try:
                response = self.session.get(f"{API_BASE}/venues/{self.test_venue_id}")
                if response.status_code == 200:
                    venue = response.json()
                    if 'id' in venue and venue['id'] == self.test_venue_id:
                        self.log_result('venue_apis', 'GET /venues/{id} - Get single venue', True)
                    else:
                        self.log_result('venue_apis', 'GET /venues/{id} - Get single venue', False, "Invalid venue data")
                else:
                    self.log_result('venue_apis', 'GET /venues/{id} - Get single venue', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('venue_apis', 'GET /venues/{id} - Get single venue', False, str(e))

        # Test 5: Create new venue
        try:
            new_venue = {
                "name": "Test Adventure Park",
                "description": "A fantastic outdoor adventure park for families with kids of all ages",
                "category": "Outdoor",
                "location": {
                    "address": "123 Adventure Street, Melbourne VIC 3000",
                    "city": "Melbourne",
                    "coordinates": {"lat": -37.8136, "lng": 144.9631}
                },
                "pricing": {"type": "paid", "amount": 25.0, "currency": "AUD"},
                "facilities": ["Parking", "Cafe", "Toilets", "First Aid"],
                "age_range": {"min": 2, "max": 16},
                "contact": {
                    "phone": "+61 3 9123 4567",
                    "email": "info@testadventurepark.com.au",
                    "website": "https://testadventurepark.com.au"
                }
            }
            
            response = self.session.post(f"{API_BASE}/venues", json=new_venue)
            if response.status_code == 200:
                created_venue = response.json()
                if 'id' in created_venue and created_venue['name'] == new_venue['name']:
                    self.log_result('venue_apis', 'POST /venues - Create venue', True)
                else:
                    self.log_result('venue_apis', 'POST /venues - Create venue', False, "Invalid response data")
            else:
                self.log_result('venue_apis', 'POST /venues - Create venue', False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result('venue_apis', 'POST /venues - Create venue', False, str(e))

        # Test 6: Nearby venues search
        try:
            response = self.session.get(f"{API_BASE}/venues/nearby/search?lat=-37.8136&lng=144.9631&radius=50")
            if response.status_code == 200:
                nearby_venues = response.json()
                self.log_result('venue_apis', 'GET /venues/nearby/search - Find nearby venues', True)
            else:
                self.log_result('venue_apis', 'GET /venues/nearby/search - Find nearby venues', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('venue_apis', 'GET /venues/nearby/search - Find nearby venues', False, str(e))

    def test_ai_recommendations(self):
        """Test AI-powered recommendations"""
        print("\n🤖 Testing AI Recommendations...")
        
        try:
            recommendation_request = {
                "user_location": {
                    "city": "Melbourne",
                    "coordinates": {"lat": -37.8136, "lng": 144.9631}
                },
                "kids_ages": [5, 8],
                "weather": "sunny",
                "time_of_day": "morning"
            }
            
            response = self.session.post(f"{API_BASE}/recommendations", json=recommendation_request)
            if response.status_code == 200:
                recommendations = response.json()
                if 'recommendations' in recommendations:
                    self.log_result('ai_recommendations', 'POST /recommendations - AI venue recommendations', True)
                else:
                    self.log_result('ai_recommendations', 'POST /recommendations - AI venue recommendations', False, "No recommendations in response")
            else:
                self.log_result('ai_recommendations', 'POST /recommendations - AI venue recommendations', False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result('ai_recommendations', 'POST /recommendations - AI venue recommendations', False, str(e))

    def test_event_apis(self):
        """Test all event-related APIs"""
        print("\n🎉 Testing Event APIs...")
        
        # Test 1: Get all events
        try:
            response = self.session.get(f"{API_BASE}/events")
            if response.status_code == 200:
                events = response.json()
                if isinstance(events, list):
                    if len(events) > 0:
                        self.test_event_id = events[0]['id']  # Store for later tests
                    self.log_result('event_apis', 'GET /events - List all events', True)
                else:
                    self.log_result('event_apis', 'GET /events - List all events', False, "Invalid response format")
            else:
                self.log_result('event_apis', 'GET /events - List all events', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('event_apis', 'GET /events - List all events', False, str(e))

        # Test 2: Get events with filters
        try:
            response = self.session.get(f"{API_BASE}/events?event_type=playdate&is_public=true")
            if response.status_code == 200:
                events = response.json()
                self.log_result('event_apis', 'GET /events with filters', True)
            else:
                self.log_result('event_apis', 'GET /events with filters', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('event_apis', 'GET /events with filters', False, str(e))

        # Test 3: Create new event
        try:
            future_date = datetime.now() + timedelta(days=7)
            new_event = {
                "title": "Family Fun Day at the Park",
                "description": "Join us for a wonderful family fun day with activities for kids of all ages!",
                "event_type": "playdate",
                "date": future_date.isoformat(),
                "location": {
                    "address": "Royal Botanic Gardens, Melbourne VIC 3004",
                    "city": "Melbourne",
                    "coordinates": {"lat": -37.8304, "lng": 144.9803}
                },
                "host_id": self.test_user_id,
                "host_name": "Sarah Johnson",
                "age_range": {"min": 3, "max": 12},
                "max_participants": 20,
                "is_public": True
            }
            
            response = self.session.post(f"{API_BASE}/events", json=new_event)
            if response.status_code == 200:
                created_event = response.json()
                if 'id' in created_event:
                    self.test_event_id = created_event['id']
                    self.log_result('event_apis', 'POST /events - Create event', True)
                else:
                    self.log_result('event_apis', 'POST /events - Create event', False, "No ID in response")
            else:
                self.log_result('event_apis', 'POST /events - Create event', False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result('event_apis', 'POST /events - Create event', False, str(e))

        # Test 4: Get single event by ID
        if self.test_event_id:
            try:
                response = self.session.get(f"{API_BASE}/events/{self.test_event_id}")
                if response.status_code == 200:
                    event = response.json()
                    if 'id' in event and event['id'] == self.test_event_id:
                        self.log_result('event_apis', 'GET /events/{id} - Get single event', True)
                    else:
                        self.log_result('event_apis', 'GET /events/{id} - Get single event', False, "Invalid event data")
                else:
                    self.log_result('event_apis', 'GET /events/{id} - Get single event', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('event_apis', 'GET /events/{id} - Get single event', False, str(e))

        # Test 5: RSVP to event
        if self.test_event_id:
            try:
                rsvp_data = {
                    "user_id": self.test_user_id,
                    "user_name": "Emma Wilson",
                    "status": "accepted"
                }
                
                response = self.session.post(f"{API_BASE}/events/{self.test_event_id}/rsvp", json=rsvp_data)
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        self.log_result('event_apis', 'POST /events/{id}/rsvp - RSVP to event', True)
                    else:
                        self.log_result('event_apis', 'POST /events/{id}/rsvp - RSVP to event', False, "Success not true")
                else:
                    self.log_result('event_apis', 'POST /events/{id}/rsvp - RSVP to event', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('event_apis', 'POST /events/{id}/rsvp - RSVP to event', False, str(e))

        # Test 6: Get event attendees
        if self.test_event_id:
            try:
                response = self.session.get(f"{API_BASE}/events/{self.test_event_id}/attendees")
                if response.status_code == 200:
                    attendees = response.json()
                    if isinstance(attendees, list):
                        self.log_result('event_apis', 'GET /events/{id}/attendees - Get attendees', True)
                    else:
                        self.log_result('event_apis', 'GET /events/{id}/attendees - Get attendees', False, "Invalid response format")
                else:
                    self.log_result('event_apis', 'GET /events/{id}/attendees - Get attendees', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('event_apis', 'GET /events/{id}/attendees - Get attendees', False, str(e))

    def test_review_apis(self):
        """Test review and rating APIs"""
        print("\n⭐ Testing Review APIs...")
        
        # Test 1: Create review
        if self.test_venue_id:
            try:
                new_review = {
                    "venue_id": self.test_venue_id,
                    "user_id": self.test_user_id,
                    "user_name": "Michael Chen",
                    "rating": 5,
                    "comment": "Absolutely fantastic venue! My kids had an amazing time. The facilities are clean and well-maintained, and the staff is very friendly and helpful."
                }
                
                response = self.session.post(f"{API_BASE}/reviews", json=new_review)
                if response.status_code == 200:
                    created_review = response.json()
                    if 'id' in created_review and created_review['rating'] == 5:
                        self.log_result('review_apis', 'POST /reviews - Create review', True)
                    else:
                        self.log_result('review_apis', 'POST /reviews - Create review', False, "Invalid review data")
                else:
                    self.log_result('review_apis', 'POST /reviews - Create review', False, f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result('review_apis', 'POST /reviews - Create review', False, str(e))

        # Test 2: Get venue reviews
        if self.test_venue_id:
            try:
                response = self.session.get(f"{API_BASE}/reviews/venue/{self.test_venue_id}")
                if response.status_code == 200:
                    reviews = response.json()
                    if isinstance(reviews, list):
                        self.log_result('review_apis', 'GET /reviews/venue/{id} - Get venue reviews', True)
                    else:
                        self.log_result('review_apis', 'GET /reviews/venue/{id} - Get venue reviews', False, "Invalid response format")
                else:
                    self.log_result('review_apis', 'GET /reviews/venue/{id} - Get venue reviews', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('review_apis', 'GET /reviews/venue/{id} - Get venue reviews', False, str(e))

    def test_booking_apis(self):
        """Test booking system APIs"""
        print("\n🎫 Testing Booking APIs...")
        
        # Test 1: Create booking
        if self.test_venue_id:
            try:
                future_date = datetime.now() + timedelta(days=3)
                new_booking = {
                    "user_id": self.test_user_id,
                    "user_name": "Lisa Thompson",
                    "venue_id": self.test_venue_id,
                    "date": future_date.isoformat(),
                    "amount": 45.0
                }
                
                response = self.session.post(f"{API_BASE}/bookings", json=new_booking)
                if response.status_code == 200:
                    created_booking = response.json()
                    if 'id' in created_booking and 'ticket_code' in created_booking:
                        self.test_booking_id = created_booking['id']
                        self.log_result('booking_apis', 'POST /bookings - Create booking', True)
                    else:
                        self.log_result('booking_apis', 'POST /bookings - Create booking', False, "Missing booking data")
                else:
                    self.log_result('booking_apis', 'POST /bookings - Create booking', False, f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result('booking_apis', 'POST /bookings - Create booking', False, str(e))

        # Test 2: Get user bookings
        try:
            response = self.session.get(f"{API_BASE}/bookings/user/{self.test_user_id}")
            if response.status_code == 200:
                bookings = response.json()
                if isinstance(bookings, list):
                    self.log_result('booking_apis', 'GET /bookings/user/{id} - Get user bookings', True)
                else:
                    self.log_result('booking_apis', 'GET /bookings/user/{id} - Get user bookings', False, "Invalid response format")
            else:
                self.log_result('booking_apis', 'GET /bookings/user/{id} - Get user bookings', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('booking_apis', 'GET /bookings/user/{id} - Get user bookings', False, str(e))

        # Test 3: Confirm booking
        if self.test_booking_id:
            try:
                response = self.session.put(f"{API_BASE}/bookings/{self.test_booking_id}/confirm")
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        self.log_result('booking_apis', 'PUT /bookings/{id}/confirm - Confirm booking', True)
                    else:
                        self.log_result('booking_apis', 'PUT /bookings/{id}/confirm - Confirm booking', False, "Success not true")
                else:
                    self.log_result('booking_apis', 'PUT /bookings/{id}/confirm - Confirm booking', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('booking_apis', 'PUT /bookings/{id}/confirm - Confirm booking', False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Famigo Backend API Tests...")
        print("=" * 60)
        
        # Test in priority order: high priority first
        self.test_venue_apis()
        self.test_ai_recommendations()
        self.test_event_apis()
        self.test_review_apis()
        self.test_booking_apis()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results['passed']
            failed = results['failed']
            total_passed += passed
            total_failed += failed
            
            status = "✅ PASS" if failed == 0 else "❌ FAIL"
            print(f"{category.replace('_', ' ').title()}: {status} ({passed} passed, {failed} failed)")
            
            if results['errors']:
                for error in results['errors']:
                    print(f"  - {error}")
        
        print(f"\nOverall: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 All tests passed! Backend APIs are working correctly.")
        else:
            print(f"⚠️  {total_failed} tests failed. Please check the errors above.")
        
        return total_failed == 0

if __name__ == "__main__":
    tester = FamigoAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)