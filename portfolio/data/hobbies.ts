export interface HobbyItem {
  id: string;
  emoji: string;
  label: string;
  category?: string;
}

export interface MemoryCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  hobbyId?: string;
}

export const HOBBIES_LIST: HobbyItem[] = [
  { id: "sports", emoji: "🏀", label: "SPORTS & HOOPS" },
  { id: "travel", emoji: "🌲", label: "TRAVEL & NATURE" },
  { id: "food", emoji: "🥩", label: "FOOD & DINING" },
  { id: "lifestyle", emoji: "🕶️", label: "LIFESTYLE & FITS" },
  { id: "memories", emoji: "📸", label: "CANDID MOMENTS" },
  { id: "outdoors", emoji: "🎯", label: "OUTDOOR RECREATION" },
];

export const MEMORY_CARDS: MemoryCard[] = [
  // 1. TAO - Dallas Cowboys Graduation Jersey
  { id: "personal-07", title: "Dallas Cowboys #88", subtitle: "Milestone Celebration", image: "/images/personal/personal-07.jpg", hobbyId: "lifestyle" },
  // 2. VIEW - Stadium Grounds Architecture
  { id: "personal-01", title: "Stadium Grounds", subtitle: "New Clark City Arena", image: "/images/personal/personal-01.jpg", hobbyId: "travel" },
  // 3. PAGKAIN - Prime Steak Dinner
  { id: "personal-04", title: "Prime Steak Dinner", subtitle: "Steakhouse Dining", image: "/images/personal/personal-04.jpg", hobbyId: "food" },

  // 4. TAO - DOS Hoopers Basketball Team
  { id: "personal-09", title: "DOS Hoopers Basketball", subtitle: "Court League & Team", image: "/images/personal/personal-09.jpg", hobbyId: "sports" },
  // 5. VIEW - Camp John Hay Pine Mountain Trees
  { id: "personal-02", title: "Camp John Hay", subtitle: "Pine Mountain Air", image: "/images/personal/personal-02.jpg", hobbyId: "travel" },
  // 6. PAGKAIN - Caramel Cheesecake Dessert
  { id: "personal-06", title: "Caramel Cheesecake", subtitle: "Desserts & Food Trips", image: "/images/personal/personal-06.jpg", hobbyId: "food" },

  // 7. TAO - Graduation Smile & Cap
  { id: "personal-08", title: "Next Chapter", subtitle: "Graduation Milestone", image: "/images/personal/personal-08.jpg", hobbyId: "memories" },
  // 8. VIEW - Sunset Beach Huts & Palms
  { id: "personal-14", title: "Sunset Shores", subtitle: "Beach Huts & Palms", image: "/images/personal/personal-14.jpg", hobbyId: "travel" },
  // 9. PAGKAIN - Fine Dining Wine Dinner
  { id: "personal-05", title: "Wine & Dinner", subtitle: "Chill Evenings", image: "/images/personal/personal-05.jpg", hobbyId: "food" },

  // 10. TAO - Beach Day with Shades & Drink
  { id: "personal-13", title: "Beach Day", subtitle: "Sunny Shores & Drinks", image: "/images/personal/personal-13.jpg", hobbyId: "travel" },
  // 11. VIEW - Candle Lighting at Church Altar
  { id: "personal-11", title: "Quiet Moments", subtitle: "Reflections & Peace", image: "/images/personal/personal-11.jpg", hobbyId: "lifestyle" },
  // 12. PAGKAIN - Table Bites & Dining
  { id: "personal-16", title: "Table Dining", subtitle: "Good Food & Moments", image: "/images/personal/personal-16.jpg", hobbyId: "food" },

  // 13. TAO - Photobooth Moments
  { id: "personal-18", title: "Candid Snaps", subtitle: "Special Moments", image: "/images/personal/personal-18.jpg", hobbyId: "memories" },
  // 14. VIEW - Evening Lights & Outdoor Spaces
  { id: "personal-17", title: "Night Lights", subtitle: "Evening Outdoor Vibe", image: "/images/personal/personal-17.jpg", hobbyId: "lifestyle" },
  // 15. TAO - Sports & Outdoors
  { id: "personal-10", title: "Range Day", subtitle: "Target & Recreation", image: "/images/personal/personal-10.jpg", hobbyId: "outdoors" },
  // 16. TAO - Candid Smiles
  { id: "personal-19", title: "Good Times", subtitle: "Spontaneous Smiles", image: "/images/personal/personal-19.jpg", hobbyId: "memories" },
  // 17. TAO - Streetwear Mirror Fit
  { id: "personal-03", title: "Streetwear & Fit", subtitle: "Everyday Aesthetic", image: "/images/personal/personal-03.jpg", hobbyId: "lifestyle" },
];
