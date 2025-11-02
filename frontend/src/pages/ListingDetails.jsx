import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Bed,
  Bath,
  Wifi,
  Car,
} from "lucide-react";
import AccomodationCard from "../components/AccomodationCard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ListingDetails = () => {
  const { id } = useParams();

  const { data: listing, isLoading, isError, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/api/listings/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted/30 rounded-lg mb-8"></div>
            <div className="h-8 bg-muted/30 rounded mb-4"></div>
            <div className="h-4 bg-muted/30 rounded mb-2"></div>
            <div className="h-4 bg-muted/30 rounded mb-2"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Listing</h1>
            <p className="text-muted-foreground">{error?.message || "Something went wrong"}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-muted-foreground">The listing you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse images
  const parseImages = (images) => {
    try {
      if (!images) return [];
      if (typeof images === "string") return JSON.parse(images);
      if (Array.isArray(images)) return images;
      return [];
    } catch {
      return [];
    }
  };

  const images = parseImages(listing.images);
  const firstImage = images
    .slice()
    .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))[0];

  const locationParts = [listing.location_area, listing.location_city]
    .filter(Boolean)
    .join(", ");

  // Mock related listings for now
  const relatedListings = [
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      title: "Another Studio",
      location: "Downtown",
      price: 900,
      type: "studio",
      rating: 4.5,
      available: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <img
                src={firstImage?.url || "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80"}
                alt={listing.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="h-[195px] md:h-[242px] rounded-xl overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt={`${listing.title} ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Location */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-foreground">
                    {listing.title}
                  </h1>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground capitalize">
                    {listing.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    {locationParts || "Location not specified"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {listing.rating || "No rating"} rating
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    About this place
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {listing.description || "No description available."}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Wifi className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium">WiFi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Bed className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium">Furnished</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Bath className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium">Bathroom</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Car className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium">Parking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews - Mock for now */}
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Tenant Reviews</h2>
                  <div className="space-y-6">
                    <div className="text-muted-foreground">No reviews yet.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Pricing Card */}
                <div className="bg-card rounded-lg border border-border">
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        ${Math.round((listing.price_monthly_cents || 0) / 100)}
                        <span className="text-lg text-muted-foreground font-normal">
                          /month
                        </span>
                      </div>
                      <span className="inline-block bg-accent px-2 py-1 rounded text-accent-foreground text-sm">
                        {listing.status === "active" ? "Available Now" : "Unavailable"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary text-white text-sm font-medium hover:opacity-95 transition"
                      aria-label="Book Now"
                    >
                      Book Now
                    </button>

                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-border bg-transparent text-sm hover:bg-muted/5 transition"
                      aria-label="Schedule Viewing"
                    >
                      Schedule Viewing
                    </button>
                  </div>
                </div>

                {/* Landlord Card - Mock for now */}
                <div className="bg-card rounded-lg border border-border">
                  <div className="p-6">
                    <h3 className="font-semibold mb-4">Landlord Information</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        alt="Landlord"
                        className="h-16 w-16 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div>
                        <h4 className="font-semibold">Landlord</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          4.9 · 12 properties
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border justify-start text-sm"
                        aria-label="Call Landlord"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Landlord
                      </button>
                      <button
                        type="button"
                        className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border justify-start text-sm"
                        aria-label="Send Message"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Listings */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((item) => (
                <AccomodationCard key={item.id} {...item} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetails;
