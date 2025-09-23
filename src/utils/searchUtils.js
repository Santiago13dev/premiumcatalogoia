// Advanced search utilities

export const parseSearchQuery = (query) => {
  const result = {
    terms: [],
    exclude: [],
    exact: [],
    tags: []
  };
  
  // Extract exact phrases (in quotes)
  const exactMatches = query.match(/"([^"]+)"/g);
  if (exactMatches) {
    result.exact = exactMatches.map(match => match.replace(/"/g, ''));
    query = query.replace(/"[^"]+"/g, '');
  }
  
  // Extract exclusions (starting with -)
  const excludeMatches = query.match(/-\w+/g);
  if (excludeMatches) {
    result.exclude = excludeMatches.map(match => match.substring(1));
    query = query.replace(/-\w+/g, '');
  }
  
  // Extract tags (starting with #)
  const tagMatches = query.match(/#\w+/g);
  if (tagMatches) {
    result.tags = tagMatches.map(match => match.substring(1));
    query = query.replace(/#\w+/g, '');
  }
  
  // Remaining terms
  result.terms = query.trim().split(/\s+/).filter(term => term.length > 0);
  
  return result;
};

export const searchComponent = (component, searchQuery) => {
  const parsed = typeof searchQuery === 'string' ? parseSearchQuery(searchQuery) : searchQuery;
  
  // Check exclusions
  for (const exclude of parsed.exclude) {
    if (
      component.name.toLowerCase().includes(exclude.toLowerCase()) ||
      component.description.toLowerCase().includes(exclude.toLowerCase())
    ) {
      return false;
    }
  }
  
  // Check exact phrases
  for (const exact of parsed.exact) {
    const found = 
      component.name.toLowerCase().includes(exact.toLowerCase()) ||
      component.description.toLowerCase().includes(exact.toLowerCase());
    if (!found) return false;
  }
  
  // Check tags
  for (const tag of parsed.tags) {
    if (!component.tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }
  }
  
  // Check general terms
  for (const term of parsed.terms) {
    const found = 
      component.name.toLowerCase().includes(term.toLowerCase()) ||
      component.description.toLowerCase().includes(term.toLowerCase()) ||
      component.tags.some(t => t.toLowerCase().includes(term.toLowerCase()));
    if (!found) return false;
  }
  
  return true;
};

export const highlightText = (text, searchTerms) => {
  if (!searchTerms || searchTerms.length === 0) return text;
  
  let highlighted = text;
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  
  return highlighted;
};