/**
 * Formats a description to embed custom fields.
 * Example: "[Beds: 2 | Baths: 1 | Sqft: 1200 | Type: Premium] Actual description here"
 */
export const encodeDescription = (desc, { beds, baths, sqft, type }) => {
  return `[Beds: ${beds || 0} | Baths: ${baths || 0} | Sqft: ${sqft || 0} | Type: ${type || 'Standard'}] ${desc}`;
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
    cleanDescription: rawDesc || ''
  };

  if (!rawDesc) return result;

  const match = rawDesc.match(/^\[(.*?)\] (.*)$/s);
  if (match) {
    result.cleanDescription = match[2];
    
    // Parse the tokens
    const tokens = match[1].split('|').map(t => t.trim());
    tokens.forEach(token => {
      const [key, value] = token.split(':').map(str => str.trim());
      if (key === 'Beds') result.beds = parseInt(value, 10);
      else if (key === 'Baths') result.baths = parseInt(value, 10);
      else if (key === 'Sqft') result.sqft = parseInt(value, 10);
      else if (key === 'Type') result.type = value;
    });
  }

  return result;
};
