// utils/allocationUtils.js

export const checkOverlap = (newStart, newEnd, existingStart, existingEnd) => {
    const startA = new Date(newStart);
    const endA = newEnd ? new Date(newEnd) : new Date('9999-12-31');
    const startB = new Date(existingStart);
    const endB = existingEnd ? new Date(existingEnd) : new Date('9999-12-31');
  
    return startA <= endB && startB <= endA;
  };
  