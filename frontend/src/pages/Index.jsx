import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import AccomodationCard from "../components/AccomodationCard";
import FilterSection from "../components/FilterSection";
import Footer from "../components/Footer";
import { Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function parseImages(images) {
  try {
    if (!images) return [];
    if (typeof images === "string") return JSON.parse(images);
    if (Array.isArray(images)) return images;
    return [];
  } catch {
    return [];
  }
}

function toCardProps(listing) {
  const images = parseImages(listing.images);
  const first = images
    .slice()
    .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))[0];

  const locationParts = [listing.location_area, listing.location_city]
    .filter(Boolean)
    .join(", ");

  return {
    id: listing.id,
    image:
      first?.url ||
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    title: listing.title,
    location: locationParts || "",
    price: Math.round((listing.price_monthly_cents || 0) / 100),
    type: listing.type,
    rating: undefined,
    available: listing.status === "active",
    landlordName: "Owner",
    landlordImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  };
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 9);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const city = searchParams.get("city") || "";
  const order = searchParams.get("order") || "newest";

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "listings",
      { page, limit, q, type, city, order },
    ],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/api/listings`, {
        params: {
          page,
          limit,
          q: q || undefined,
          type: type || undefined,
          city: city || undefined,
          order,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const listings = data?.listings || [];
  const total = data?.total || 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function setPage(newPage) {
    const obj = Object.fromEntries(searchParams.entries());
    obj.page = String(newPage);
    obj.limit = String(limit);
    setSearchParams(obj);
  }

  function onRetry() {
    refetch();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Find Your Perfect Stay</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Discover Your Ideal
              <span className="text-primary"> Accommodation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search thousands of verified listings for rooms, apartments, and hostels.
              Your perfect home is just a click away.
            </p>
          </div>

          <SearchBar />
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="sticky top-24">
                <FilterSection />
              </div>
            </aside>

            {/* Listings Grid */}
            <main className="flex-1">
              <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    Available Accommodations
                  </h2>
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : isError ? (
                    <p className="text-red-600">Failed to load listings</p>
                  ) : (
                    <p className="text-muted-foreground">{total} properties found</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isFetching && <span>Updating...</span>}
                </div>
              </div>

              {isError && (
                <div className="mb-6">
                  <button
                    onClick={onRetry}
                    className="px-3 py-2 rounded border border-border hover:bg-muted/10"
                  >
                    Retry
                  </button>
                  {error?.message && (
                    <p className="text-xs text-muted-foreground mt-2">{String(error.message)}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading && (
                  <>
                    {Array.from({ length: limit }).map((_, i) => (
                      <div
                        key={i}
                        className="h-80 bg-muted/30 animate-pulse rounded-lg border border-border"
                      />
                    ))}
                  </>
                )}

                {!isLoading && !isError && listings.length === 0 && (
                  <div className="text-muted-foreground">No properties found.</div>
                )}

                {!isLoading && !isError &&
                  listings.map((l) => (
                    <AccomodationCard key={l.id} {...toCardProps(l)} />
                  ))}
              </div>

              {/* Pagination */}
              {!isLoading && !isError && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => canPrev && setPage(page - 1)}
                    className={`px-3 py-2 rounded border ${
                      canPrev ? "hover:bg-muted/10" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => canNext && setPage(page + 1)}
                    className={`px-3 py-2 rounded border ${
                      canNext ? "hover:bg-muted/10" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
