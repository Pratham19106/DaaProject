import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import HotelCard from './HotelCard';
import AttractionCard from './AttractionCard';

export default function HorizontalCardScroll({ items, type = 'hotel' }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {type === 'hotel' ? '🏨 Hotels' : '🎯 Attractions'}
      </div>

      {/* Scrollable Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Scroll Container - Fixed width with overflow */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            maxWidth: 'calc(100vw - 100px)',
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80"
            >
              {type === 'hotel' ? (
                <HotelCardCompact hotel={item} />
              ) : (
                <AttractionCardCompact attraction={item} />
              )}
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
}

// Compact Hotel Card for horizontal scroll
function HotelCardCompact({ hotel }) {
  const {
    name,
    rating,
    reviews,
    pricePerNight,
    thumbnail,
    logo,
    amenities,
  } = hotel;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
        {/* Logo */}
        {logo && (
          <div className="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700">
            <img
              src={logo}
              alt="logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Name */}
        <h3 className="font-bold text-sm line-clamp-2 mb-1">{name}</h3>

        {/* Rating */}
        {rating && rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-semibold">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
            <span className="text-xs text-muted-foreground">
              ({reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        {pricePerNight && (
          <div className="text-sm font-bold text-primary mb-2">
            ₹{pricePerNight.toLocaleString()}/night
          </div>
        )}

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {amenities.slice(0, 2).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span>✓</span>
                <span className="line-clamp-1">{amenity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact Attraction Card for horizontal scroll
function AttractionCardCompact({ attraction }) {
  const {
    name,
    rating,
    reviews,
    price,
    thumbnail,
    category,
  } = attraction;

  const categoryEmoji = {
    history: '🏛️',
    nature: '🌳',
    beaches: '🏖️',
    spirituality: '🕉️',
    adventure: '⛰️',
    shopping: '🛍️',
    general: '📍',
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `₹${price}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
            {category ? (categoryEmoji[category] || categoryEmoji.general) : categoryEmoji.general}
          </span>
        </div>
        {/* Price Badge */}
        {price !== undefined && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold shadow-md">
              {formatPrice(price)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Name */}
        <h3 className="font-bold text-sm line-clamp-2 mb-1">{name}</h3>

        {/* Rating */}
        {rating && rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-semibold">⭐ {typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
            <span className="text-xs text-muted-foreground">
              ({reviews || 0})
            </span>
          </div>
        )}

        {/* Category */}
        {category && (
          <div className="text-xs text-muted-foreground">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
}
