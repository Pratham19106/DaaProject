/**
 * Local Storage & History Management
 * Manages trip history and autofill data
 */

const STORAGE_KEYS = {
  TRIP_HISTORY: 'trippeIndia_tripHistory',
  RECENT_DESTINATIONS: 'trippeIndia_recentDestinations',
  RECENT_BUDGETS: 'trippeIndia_recentBudgets',
  RECENT_TRAVELERS: 'trippeIndia_recentTravelers',
  RECENT_INTERESTS: 'trippeIndia_recentInterests',
};

/**
 * Save trip to history
 */
export function saveTripToHistory(tripData) {
  try {
    const history = getTripHistory();
    
    const trip = {
      id: Date.now(),
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      adults: tripData.adults,
      children: tripData.children,
      budgetInr: tripData.budgetInr,
      interests: tripData.interests,
      hotelClass: tripData.hotelClass,
      diet: tripData.diet,
      savedAt: new Date().toISOString(),
    };

    history.unshift(trip); // Add to beginning
    history.splice(20); // Keep only last 20 trips

    localStorage.setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(history));

    // Also save individual fields for quick autofill
    saveRecentDestination(tripData.destination);
    saveRecentBudget(tripData.budgetInr);
    saveRecentTravelers({ adults: tripData.adults, children: tripData.children });
    saveRecentInterests(tripData.interests);

    return trip;
  } catch (error) {
    console.error('Error saving trip to history:', error);
  }
}

/**
 * Get full trip history
 */
export function getTripHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.TRIP_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting trip history:', error);
    return [];
  }
}

/**
 * Get recent destinations
 */
export function getRecentDestinations() {
  try {
    const destinations = localStorage.getItem(STORAGE_KEYS.RECENT_DESTINATIONS);
    return destinations ? JSON.parse(destinations) : [];
  } catch (error) {
    console.error('Error getting recent destinations:', error);
    return [];
  }
}

/**
 * Save recent destination
 */
function saveRecentDestination(destination) {
  try {
    if (!destination) return;

    const destinations = getRecentDestinations();
    
    // Remove if already exists
    const filtered = destinations.filter(d => d.name !== destination);
    
    // Add to beginning with count
    const existing = destinations.find(d => d.name === destination);
    filtered.unshift({
      name: destination,
      count: (existing?.count || 0) + 1,
      lastUsed: new Date().toISOString(),
    });

    // Keep only top 10
    filtered.splice(10);

    localStorage.setItem(STORAGE_KEYS.RECENT_DESTINATIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving recent destination:', error);
  }
}

/**
 * Get recent budgets
 */
export function getRecentBudgets() {
  try {
    const budgets = localStorage.getItem(STORAGE_KEYS.RECENT_BUDGETS);
    return budgets ? JSON.parse(budgets) : [];
  } catch (error) {
    console.error('Error getting recent budgets:', error);
    return [];
  }
}

/**
 * Save recent budget
 */
function saveRecentBudget(budget) {
  try {
    if (!budget) return;

    const budgets = getRecentBudgets();
    
    // Remove if already exists
    const filtered = budgets.filter(b => b.amount !== budget);
    
    // Add to beginning
    filtered.unshift({
      amount: budget,
      count: 1,
      lastUsed: new Date().toISOString(),
    });

    // Keep only top 10
    filtered.splice(10);

    localStorage.setItem(STORAGE_KEYS.RECENT_BUDGETS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving recent budget:', error);
  }
}

/**
 * Get recent travelers
 */
export function getRecentTravelers() {
  try {
    const travelers = localStorage.getItem(STORAGE_KEYS.RECENT_TRAVELERS);
    return travelers ? JSON.parse(travelers) : [];
  } catch (error) {
    console.error('Error getting recent travelers:', error);
    return [];
  }
}

/**
 * Save recent travelers
 */
function saveRecentTravelers(travelers) {
  try {
    if (!travelers) return;

    const key = `${travelers.adults}A${travelers.children}C`;
    const allTravelers = getRecentTravelers();
    
    // Remove if already exists
    const filtered = allTravelers.filter(t => t.key !== key);
    
    // Add to beginning
    filtered.unshift({
      key,
      adults: travelers.adults,
      children: travelers.children,
      count: 1,
      lastUsed: new Date().toISOString(),
    });

    // Keep only top 10
    filtered.splice(10);

    localStorage.setItem(STORAGE_KEYS.RECENT_TRAVELERS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving recent travelers:', error);
  }
}

/**
 * Get recent interests
 */
export function getRecentInterests() {
  try {
    const interests = localStorage.getItem(STORAGE_KEYS.RECENT_INTERESTS);
    return interests ? JSON.parse(interests) : [];
  } catch (error) {
    console.error('Error getting recent interests:', error);
    return [];
  }
}

/**
 * Save recent interests
 */
function saveRecentInterests(interests) {
  try {
    if (!interests || interests.length === 0) return;

    const allInterests = getRecentInterests();
    
    // Update counts for each interest
    interests.forEach(interest => {
      const existing = allInterests.find(i => i.name === interest);
      if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.lastUsed = new Date().toISOString();
      } else {
        allInterests.push({
          name: interest,
          count: 1,
          lastUsed: new Date().toISOString(),
        });
      }
    });

    // Sort by count (most used first)
    allInterests.sort((a, b) => b.count - a.count);

    // Keep only top 20
    allInterests.splice(20);

    localStorage.setItem(STORAGE_KEYS.RECENT_INTERESTS, JSON.stringify(allInterests));
  } catch (error) {
    console.error('Error saving recent interests:', error);
  }
}

/**
 * Get last trip for quick fill
 */
export function getLastTrip() {
  const history = getTripHistory();
  return history.length > 0 ? history[0] : null;
}

/**
 * Get suggested autofill data
 */
export function getSuggestedAutofill() {
  return {
    destinations: getRecentDestinations(),
    budgets: getRecentBudgets(),
    travelers: getRecentTravelers(),
    interests: getRecentInterests(),
    lastTrip: getLastTrip(),
  };
}

/**
 * Clear all history
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRIP_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.RECENT_DESTINATIONS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_TRAVELERS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_INTERESTS);
    console.log('All history cleared');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Export trip history as JSON
 */
export function exportHistory() {
  try {
    const history = getTripHistory();
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trippeIndia-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting history:', error);
  }
}
