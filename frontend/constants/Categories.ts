// Main Categories with Famigo Structure
export const CATEGORIES = [
  { 
    id: 'all', 
    label: 'All', 
    icon: 'apps',
    color: '#6D9773',
    description: 'All activities'
  },
  { 
    id: 'playgrounds', 
    label: 'Playgrounds & Outdoor', 
    icon: 'basketball',
    color: '#10B981',
    description: 'Public playgrounds, adventure parks, nature trails',
    subcategories: ['Public Playgrounds', 'Adventure Parks', 'Nature Trails']
  },
  { 
    id: 'indoor-play', 
    label: 'Soft Play / Indoor', 
    icon: 'home',
    color: '#6D9773',
    description: 'Indoor play centers, trampolines, climbing',
    subcategories: ['Indoor Play Centers', 'Trampoline Parks', 'Climbing', 'Toddler Sensory']
  },
  { 
    id: 'animals', 
    label: 'Animals & Nature', 
    icon: 'paw',
    color: '#BB8A52',
    description: 'Farms, wildlife parks, aquariums',
    subcategories: ['Farms & Petting Zoos', 'Wildlife Parks', 'Aquariums', 'Bird Sanctuaries']
  },
  { 
    id: 'arts-learning', 
    label: 'Arts & Learning', 
    icon: 'color-palette',
    color: '#8B5CF6',
    description: 'Art workshops, STEM, music, museums',
    subcategories: ['Art & Craft', 'STEM Workshops', 'Music & Dance', 'Science Centers']
  },
  { 
    id: 'events', 
    label: 'Events & Seasonal', 
    icon: 'calendar',
    color: '#3B82F6',
    description: 'Circus, festivals, holiday events',
    subcategories: ['Circus Shows', 'Festivals & Fairs', 'Holiday Events', 'Pop-Up Exhibitions']
  },
  { 
    id: 'parties', 
    label: 'Birthday & Parties', 
    icon: 'gift',
    color: '#EC4899',
    description: 'Party venues and packages',
    subcategories: ['Party Packages', 'Outdoor Parties', 'Themed Experiences']
  },
  { 
    id: 'sports', 
    label: 'Sports & Activities', 
    icon: 'football',
    color: '#F59E0B',
    description: 'Swimming, martial arts, mini golf',
    subcategories: ['Swimming Pools', 'Martial Arts', 'Mini Golf', 'Sport Clinics']
  },
  { 
    id: 'shopping', 
    label: 'Shopping & Entertainment', 
    icon: 'cart',
    color: '#06B6D4',
    description: 'Mall play areas, cinema, arcades',
    subcategories: ['Mall Play Areas', 'Family Cinema', 'Arcades', 'Mall Workshops']
  },
  { 
    id: 'creative', 
    label: 'Creative Experiences', 
    icon: 'bulb',
    color: '#FFBA00',
    description: 'Cooking classes, gardening, escape rooms',
    subcategories: ['Cooking Classes', 'Gardening Programs', 'Escape Rooms']
  },
  { 
    id: 'community', 
    label: 'Community & Playgroups', 
    icon: 'people',
    color: '#6D9773',
    description: 'Parent groups, playdates, library events',
    subcategories: ['Parent Groups', 'Playdates', 'Holiday Programs', 'Library Events']
  },
];

// Age Ranges
export const AGE_RANGES = [
  { id: '0-3', label: '0-3 years', min: 0, max: 3 },
  { id: '4-7', label: '4-7 years', min: 4, max: 7 },
  { id: '8-12', label: '8-12 years', min: 8, max: 12 },
];

// Budget Filters
export const PRICE_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'low-cost', label: 'Low-Cost ($1-$20)' },
  { id: 'premium', label: 'Premium ($20+)' },
];

// Distance Filters
export const DISTANCE_FILTERS = [
  { id: 'all', label: 'Any distance' },
  { id: '5km', label: 'Under 5km', max: 5 },
  { id: '10km', label: '5-10km', min: 5, max: 10 },
  { id: '20km', label: '10-20km', min: 10, max: 20 },
];

// Weather Filters
export const WEATHER_FILTERS = [
  { id: 'all', label: 'Any weather' },
  { id: 'indoor', label: 'Indoor (Rainy day)', icon: 'rainy' },
  { id: 'outdoor', label: 'Outdoor (Sunny day)', icon: 'sunny' },
  { id: 'covered', label: 'Covered/Sheltered', icon: 'umbrella' },
];

// Duration Filters
export const DURATION_FILTERS = [
  { id: 'all', label: 'Any duration' },
  { id: 'short', label: 'Short (<1h)' },
  { id: 'medium', label: 'Medium (1-2h)' },
  { id: 'full-day', label: 'Full Day (2h+)' },
];

// Special Features
export const SPECIAL_FEATURES = [
  { id: 'accessible', label: 'Wheelchair Accessible', icon: 'accessibility' },
  { id: 'sensory-friendly', label: 'Sensory Friendly', icon: 'hand-left' },
  { id: 'shade', label: 'Shade/Shelter', icon: 'umbrella' },
  { id: 'parking', label: 'Parking Available', icon: 'car' },
  { id: 'cafe', label: 'Café On-Site', icon: 'cafe' },
  { id: 'toilets', label: 'Toilets Available', icon: 'water' },
];