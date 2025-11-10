import { Star, MapPin, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HotelCard({ hotel }) {
  const {
    name,
    description,
    rating,
    reviews,
    stars,
    pricePerNight,
    totalPrice,
    currency = 'INR',
    thumbnail,
    logo,
    amenities = [],
    excludedAmenities = [],
    checkInTime,
    checkOutTime,
    address,
    ecoCertified,
    sponsored,
  } = hotel;

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Render star rating
  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < count
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Hotel Image */}
      {thumbnail && (
        <div className="relative h-48 bg-muted">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            {ecoCertified && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                Eco-Certified
              </span>
            )}
            {sponsored && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Sponsored
              </span>
            )}
          </div>

          {/* Logo overlay */}
          {logo && logo !== thumbnail && (
            <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-1 rounded shadow-md">
              <img
                src={logo}
                alt={`${name} logo`}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Hotel Info */}
      <div className="p-4">
        {/* Name and Stars */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{name}</h3>
            {stars > 0 && (
              <div className="flex items-center gap-1">
                {renderStars(stars)}
                <span className="text-xs text-muted-foreground ml-1">
                  {stars}-star
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Rating and Reviews */}
        {rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold text-sm">
              {rating.toFixed(1)}
            </div>
            <div className="text-sm">
              <div className="font-medium">
                {rating >= 4.5 ? 'Excellent' : rating >= 4.0 ? 'Very Good' : 'Good'}
              </div>
              {reviews > 0 && (
                <div className="text-xs text-muted-foreground">
                  {reviews.toLocaleString()} reviews
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{address}</span>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1">Amenities:</div>
            <div className="flex flex-wrap gap-1">
              {amenities.slice(0, 5).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded"
                >
                  <Check className="w-3 h-3" />
                  {amenity}
                </span>
              ))}
              {amenities.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{amenities.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Excluded Amenities */}
        {excludedAmenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {excludedAmenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-2 py-0.5 rounded"
                >
                  <X className="w-3 h-3" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Check-in/out Times */}
        {(checkInTime || checkOutTime) && (
          <div className="text-xs text-muted-foreground mb-3">
            {checkInTime && <div>Check-in: {checkInTime}</div>}
            {checkOutTime && <div>Check-out: {checkOutTime}</div>}
          </div>
        )}

        {/* Price */}
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Per night</div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(pricePerNight)}
              </div>
            </div>
            {totalPrice && totalPrice !== pricePerNight && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-semibold">
                  {formatPrice(totalPrice)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
