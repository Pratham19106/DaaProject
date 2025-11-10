import { MapPin, Calendar, IndianRupee, Users, Heart, Play, History, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSuggestedAutofill, saveTripToHistory } from '../utils/storage.js';

const interests = [
  'history', 'nature', 'beaches', 'food', 
  'nightlife', 'spirituality', 'adventure', 'shopping'
];

export default function ContextPanel({ context, setContext, onPlanTrip }) {
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load suggestions on mount
    const autofill = getSuggestedAutofill();
    setSuggestions(autofill);
  }, []);

  const updateContext = (key, value) => {
    setContext(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest) => {
    const current = context.interests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    updateContext('interests', updated);
  };

  const handlePlanTrip = () => {
    if (!context.destination || !context.startDate || !context.endDate || !context.budgetInr) {
      alert('Please fill in destination, dates, and budget to plan your trip!');
      return;
    }
    // Save to history before planning
    saveTripToHistory(context);
    if (onPlanTrip) {
      onPlanTrip();
    }
  };

  const fillFromLastTrip = () => {
    if (suggestions?.lastTrip) {
      const trip = suggestions.lastTrip;
      setContext(prev => ({
        ...prev,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        adults: trip.adults,
        children: trip.children,
        budgetInr: trip.budgetInr,
        interests: trip.interests,
        hotelClass: trip.hotelClass,
        diet: trip.diet,
      }));
      setShowSuggestions(false);
    }
  };

  const fillDestination = (destination) => {
    updateContext('destination', destination);
  };

  const fillBudget = (budget) => {
    updateContext('budgetInr', budget);
  };

  const fillTravelers = (travelers) => {
    updateContext('adults', travelers.adults);
    updateContext('children', travelers.children);
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Trip Preferences
        </h2>
        {suggestions?.lastTrip && (
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <History className="w-4 h-4" />
            History
          </button>
        )}
      </div>

      {/* Quick Fill from History */}
      {showSuggestions && suggestions?.lastTrip && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              Quick Fill Options
            </h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Last Trip Button */}
          <button
            onClick={fillFromLastTrip}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            <p className="font-semibold text-sm">📍 {suggestions.lastTrip.destination}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {suggestions.lastTrip.startDate} → {suggestions.lastTrip.endDate}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ₹{suggestions.lastTrip.budgetInr} • {suggestions.lastTrip.adults}A {suggestions.lastTrip.children}C
            </p>
          </button>

          {/* Recent Destinations */}
          {suggestions.destinations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Recent Destinations:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.destinations.slice(0, 5).map((dest, idx) => (
                  <button
                    key={idx}
                    onClick={() => fillDestination(dest.name)}
                    className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Budgets */}
          {suggestions.budgets?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Recent Budgets:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.budgets.slice(0, 5).map((budget, idx) => (
                  <button
                    key={idx}
                    onClick={() => fillBudget(budget.amount)}
                    className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    ₹{budget.amount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Travelers */}
          {suggestions.travelers?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Recent Travelers:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.travelers.slice(0, 5).map((traveler, idx) => (
                  <button
                    key={idx}
                    onClick={() => fillTravelers(traveler)}
                    className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    {traveler.adults}A {traveler.children}C
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Destination */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          Destination
        </label>
        <input
          type="text"
          placeholder="e.g., Jaipur, Goa"
          value={context.destination || ''}
          onChange={(e) => updateContext('destination', e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4" />
            Start Date
          </label>
          <input
            type="date"
            value={context.startDate || ''}
            onChange={(e) => updateContext('startDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">End Date</label>
          <input
            type="date"
            value={context.endDate || ''}
            onChange={(e) => updateContext('endDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-sm"
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <IndianRupee className="w-4 h-4" />
          Budget (INR)
        </label>
        <input
          type="number"
          placeholder="e.g., 30000"
          value={context.budgetInr || ''}
          onChange={(e) => updateContext('budgetInr', parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-md bg-background"
        />
      </div>

      {/* Group Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Users className="w-4 h-4" />
            Adults
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={context.adults !== undefined ? context.adults : '2'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+$/.test(val)) {
                updateContext('adults', val === '' ? '' : parseInt(val));
              }
            }}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Children</label>
          <input
            type="text"
            inputMode="numeric"
            value={context.children !== undefined ? context.children : '0'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+$/.test(val)) {
                updateContext('children', val === '' ? '' : parseInt(val));
              }
            }}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="text-sm font-medium mb-2 block">Interests</label>
        <div className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (context.interests || []).includes(interest)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Class */}
      <div>
        <label className="text-sm font-medium mb-2 block">Hotel Preference</label>
        <select
          value={context.hotelClass || 'mid-range'}
          onChange={(e) => updateContext('hotelClass', e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="budget">Budget</option>
          <option value="mid-range">Mid-range</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      {/* Diet */}
      <div>
        <label className="text-sm font-medium mb-2 block">Dietary Preference</label>
        <select
          value={context.diet || 'any'}
          onChange={(e) => updateContext('diet', e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="any">Any</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="non-veg">Non-Veg</option>
        </select>
      </div>

      {/* Plan Trip Button */}
      <button
        onClick={handlePlanTrip}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
      >
        <Play className="w-5 h-5" />
        Plan My Trip
      </button>
    </div>
  );
}
