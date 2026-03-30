/**
 * Formats a description to embed custom fields.
 * Example: "[Beds: 2 | Baths: 1 | Sqft: 1200 | Type: Premium | Amenities: parking,clubhouse,gym] Actual description here"
 */
export const encodeDescription = (desc, { beds, baths, sqft, type, amenities = [] }) => {
  const amenitiesStr = amenities.length > 0 ? ` | Amenities: ${amenities.join(',')}` : '';
  return `[Beds: ${beds || 0} | Baths: ${baths || 0} | Sqft: ${sqft || 0} | Type: ${type || 'Standard'}${amenitiesStr}] ${desc}`;
};

/**
 * Parses the custom fields back out of the description string.
 */
export const parseDescription = (rawDesc) => {
  const result = {
    beds: 0,
    baths: 0,
    sqft: 0,
    type: 'Standard',
    amenities: [],
    cleanDescription: rawDesc || ''
  };

  if (!rawDesc) return result;

  const match = rawDesc.match(/^\[(.*?)\] (.*)$/s);
  if (match) {
    result.cleanDescription = match[2];
    
    // Parse the tokens
    const tokens = match[1].split('|').map(t => t.trim());
    tokens.forEach(token => {
      const [key, ...valueParts] = token.split(':').map(str => str.trim());
      const value = valueParts.join(':').trim();
      if (key === 'Beds') result.beds = parseInt(value, 10);
      else if (key === 'Baths') result.baths = parseInt(value, 10);
      else if (key === 'Sqft') result.sqft = parseInt(value, 10);
      else if (key === 'Type') result.type = value;
      else if (key === 'Amenities') result.amenities = value.split(',').map(a => a.trim()).filter(Boolean);
    });
  }

  return result;
};

// All available amenities
export const AMENITIES_LIST = [
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'clubhouse', label: 'Club House', icon: '🏛️' },
  { id: 'gym', label: 'Gym / Fitness', icon: '🏋️' },
  { id: 'swimming_pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'garden', label: 'Garden / Park', icon: '🌳' },
  { id: 'security', label: '24/7 Security', icon: '🔒' },
  { id: 'power_backup', label: 'Power Backup', icon: '⚡' },
  { id: 'water_supply', label: '24/7 Water Supply', icon: '💧' },
  { id: 'elevator', label: 'Elevator / Lift', icon: '🛗' },
  { id: 'cctv', label: 'CCTV Surveillance', icon: '📹' },
  { id: 'playground', label: 'Children Playground', icon: '🎠' },
  { id: 'wifi', label: 'WiFi / Internet', icon: '📶' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'furnished', label: 'Fully Furnished', icon: '🛋️' },
  { id: 'balcony', label: 'Balcony', icon: '🏠' },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' },
];
