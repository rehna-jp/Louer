import { MapPin, Star, DollarSign } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const AccomodationCard = ({
  id,
  image,
  title,
  location,
  price,
  type,
  rating,
  available,
  landlordName,
  landlordImage,
}) => {
  return (
    <Link to={`/listing/${id}`}>
      <div className="overflow-hidden card-hover cursor-pointer h-full bg-card rounded-lg border border-border shadow-sm">
        <div className="relative h-56 overflow-hidden rounded-t-lg">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <span
            className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${
              available
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {available ? "Available" : "Occupied"}
          </span>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {typeof rating === "number" ? rating.toFixed(1) : "—"}
              </span>
            </div>
            <span className="inline-block bg-muted/60 px-2 py-1 rounded capitalize text-sm">
              {type}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <img
                src={landlordImage}
                alt={landlordName}
                loading="lazy"
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-sm text-muted-foreground">
                {landlordName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-lg font-bold text-primary">${price}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AccomodationCard;
