import { Star, MapPin, Clock, Phone, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttractionCard({ attraction }) {
  const {
    name,
    description,
    rating,
    reviews,
    category,
    price,
    thumbnail,
    address,
    hours,
    phone,
    website,
  } = attraction;

  // Category emoji mapping
  const categoryEmoji = {
    history: '🏛️',
    nature: '🌳',
    beaches: '🏖️',
    spirituality: '🕉️',
    adventure: '⛰️',
    shopping: '🛍️',
    general: '📍',
  };

  // Category color mapping
  const categoryColor = {
    history: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100',
    nature: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    beaches: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    spirituality: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
    adventure: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    shopping: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100',
    general: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100',
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `₹${price}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Attraction Image */}
      {thumbnail && (
        <div className="relative h-40 bg-muted">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${categoryColor[category] || categoryColor.general}`}>
              {categoryEmoji[category] || categoryEmoji.general}
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>

          {/* Price Badge */}
          {price !== undefined && (
            <div className="absolute top-2 right-2">
              <span className="bg-white dark:bg-gray-800 text-primary font-bold text-sm px-2 py-1 rounded shadow-md">
                {formatPrice(price)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Attraction Info */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="mb-2">
          <h3 className="font-bold text-lg mb-1">{name}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
              {reviews > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({reviews.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Address */}
        {address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>
        )}

        {/* Hours */}
        {hours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{hours}</span>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex gap-3 mt-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Globe className="w-3 h-3" />
              Website
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
