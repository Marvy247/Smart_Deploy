export const formatDate = (isoString?: string | null): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    // Use UTC methods and pad with zeros for consistent formatting
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${month}/${day}/${year}`; // Always returns MM/DD/YYYY format
  } catch {
    return '';
  }
};
