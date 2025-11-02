import { Search, MapPin, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [location, setLocation] = useState("");
  const [type, setType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Initialize from URL params
  useEffect(() => {
    const cityParam = searchParams.get("city") || "";
    const typeParam = searchParams.get("type") || "all";
    setLocation(cityParam);
    setType(typeParam || "all");
  }, [searchParams]);

  const setMin = (value) => {
    const v = Number(value);
    setPriceRange(([_, max]) => [Math.min(v, max), max]);
  };

  const setMax = (value) => {
    const v = Number(value);
    setPriceRange(([min, _]) => [min, Math.max(v, min)]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Update URL params to trigger refetch in Index.jsx
    const next = new URLSearchParams(searchParams);
    // Reset pagination to first page on new search
    next.set("page", "1");

    const trimmedCity = location.trim();
    if (trimmedCity) next.set("city", trimmedCity); else next.delete("city");

    if (type && type !== "all") next.set("type", type); else next.delete("type");

    // Note: price range is currently UI-only; backend doesn't support price filters yet.
    setSearchParams(next);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card rounded-2xl shadow-xl p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city or area..."
            className="h-12 w-full px-3 rounded-md border border-border bg-input text-foreground focus:outline-none"
            aria-label="Location"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Accommodation Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-12 w-full px-3 rounded-md border border-border bg-input text-foreground"
            aria-label="Accommodation type"
          >
            <option value="all">All Types</option>
            <option value="room">Room</option>
            <option value="apartment">Apartment</option>
            <option value="hostel">Hostel</option>
            <option value="studio">Studio</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            Price Range (${priceRange[0]} - ${priceRange[1]})
          </label>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={priceRange[0]}
                onChange={(e) => setMin(e.target.value)}
                className="w-full"
                aria-label="Minimum price"
              />
            </div>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={priceRange[1]}
                onChange={(e) => setMax(e.target.value)}
                className="w-full"
                aria-label="Maximum price"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
            <div>Min: ${priceRange[0]}</div>
            <div>Max: ${priceRange[1]}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-95 transition"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Search Accommodations
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
