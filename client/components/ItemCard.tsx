import { Link } from "react-router-dom";
import { Item } from "@shared/api";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

interface ItemCardProps {
  item: Item;
}

export const ItemCard = ({ item }: ItemCardProps) => {
  const bgColorClass = item.type === "lost" 
    ? "hover:shadow-lg hover:border-red-300" 
    : "hover:shadow-lg hover:border-green-300";
  
  const badgeColorClass = item.type === "lost"
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";

  // Use imageUrls if available, otherwise fall back to imageUrl
  const displayImages = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl];
  const hasMultipleImages = displayImages.length > 1;

  return (
    <Link
      to={`/item/${item.id}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:scale-105 ${bgColorClass}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={displayImages[0]}
          alt={item.title}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${badgeColorClass}`}>
          {item.type === "lost" ? "Lost" : "Found"}
        </div>
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
            +{displayImages.length - 1} more
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={16} className="flex-shrink-0" />
            <span>{new Date(item.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            {item.status === "active" ? "Active" : "Claimed"}
          </span>
          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
