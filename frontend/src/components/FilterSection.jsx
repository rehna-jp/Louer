import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";

const FilterSection = () => {
  const idPrefix = useId();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openSections, setOpenSections] = useState({
    availability: true,
    type: true,
    amenities: true,
  });

  const [filters, setFilters] = useState({
    availability: { available: true, soon: false },
    types: { room: true, apartment: true, hostel: true, studio: true },
    amenities: {
      wifi: false,
      parking: false,
      furnished: false,
      laundry: false,
    },
  });

  // Initialize from URL search params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const statusParam = searchParams.get("status");
    setFilters((prev) => {
      const next = { ...prev };
      if (typeParam) {
        const all = { room: false, apartment: false, hostel: false, studio: false };
        if (typeParam in all) all[typeParam] = true;
        next.types = all;
      }
      if (statusParam) {
        // status can be active/occupied/inactive/draft; map to availability flags
        next.availability = {
          available: statusParam === "active",
          soon: statusParam === "inactive", // placeholder mapping
        };
      }
      return next;
    });
  }, [searchParams]);

  const toggleSection = (section) =>
    setOpenSections((p) => ({ ...p, [section]: !p[section] }));

  const toggleObj = (group, key) =>
    setFilters((p) => ({
      ...p,
      [group]: { ...p[group], [key]: !p[group][key] },
    }));

  const clearAll = () =>
    setFilters({
      availability: { available: false, soon: false },
      types: { room: false, apartment: false, hostel: false, studio: false },
      amenities: {
        wifi: false,
        parking: false,
        furnished: false,
        laundry: false,
      },
    });

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.set("page", "1");

    // Map types to single 'type' query if exactly one is selected; otherwise remove
    const typeKeys = Object.entries(filters.types)
      .filter(([_, v]) => !!v)
      .map(([k]) => k);
    if (typeKeys.length === 1) next.set("type", typeKeys[0]);
    else next.delete("type");

    // Map availability to status if available true
    if (filters.availability.available) next.set("status", "active");
    else next.delete("status");

    // Amenities not supported in backend yet; ignore for URL for now

    setSearchParams(next);
  };

  const Section = ({ id, title, open, onToggle, children }) => (
    <div>
      <button
        id={id}
        type="button"
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <h4 className="font-medium text-sm">{title}</h4>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={`${id}-content`} className="px-6 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Filters
          </h3>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-2 py-1 rounded hover:bg-muted/30"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        <Section
          id={`${idPrefix}-availability`}
          title="Availability"
          open={openSections.availability}
          onToggle={() => toggleSection("availability")}
        >
          <div className="flex items-center space-x-2">
            <input
              id={`${idPrefix}-available`}
              type="checkbox"
              checked={filters.availability.available}
              onChange={() => toggleObj("availability", "available")}
              className="h-4 w-4 rounded"
            />
            <label
              htmlFor={`${idPrefix}-available`}
              className="text-sm cursor-pointer font-normal"
            >
              Available Now
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id={`${idPrefix}-soon`}
              type="checkbox"
              checked={filters.availability.soon}
              onChange={() => toggleObj("availability", "soon")}
              className="h-4 w-4 rounded"
            />
            <label
              htmlFor={`${idPrefix}-soon`}
              className="text-sm cursor-pointer font-normal"
            >
              Available Soon
            </label>
          </div>
        </Section>

        <Section
          id={`${idPrefix}-type`}
          title="Property Type"
          open={openSections.type}
          onToggle={() => toggleSection("type")}
        >
          {["room", "apartment", "hostel", "studio"].map((t) => (
            <div key={t} className="flex items-center space-x-2">
              <input
                id={`${idPrefix}-${t}`}
                type="checkbox"
                checked={!!filters.types[t]}
                onChange={() => toggleObj("types", t)}
                className="h-4 w-4 rounded"
              />
              <label
                htmlFor={`${idPrefix}-${t}`}
                className="text-sm cursor-pointer font-normal capitalize"
              >
                {t}
              </label>
            </div>
          ))}
        </Section>

        <Section
          id={`${idPrefix}-amenities`}
          title="Amenities"
          open={openSections.amenities}
          onToggle={() => toggleSection("amenities")}
        >
          {["wifi", "parking", "furnished", "laundry"].map((a) => (
            <div key={a} className="flex items-center space-x-2">
              <input
                id={`${idPrefix}-${a}`}
                type="checkbox"
                checked={!!filters.amenities[a]}
                onChange={() => toggleObj("amenities", a)}
                className="h-4 w-4 rounded"
              />
              <label
                htmlFor={`${idPrefix}-${a}`}
                className="text-sm cursor-pointer font-normal capitalize"
              >
                {a}
              </label>
            </div>
          ))}
        </Section>
      </div>

      <div className="p-6 border-t border-border bg-muted/20">
        <button
          type="button"
          onClick={applyFilters}
          className="w-full bg-primary text-white py-2 rounded"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
