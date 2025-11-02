import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  MapPin,
  Upload,
  Heart,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

// Helpers and formatters
const getBadgeClasses = (variant) => {
  switch (variant) {
    case "default":
      return "inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs";
    case "secondary":
      return "inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs";
    case "destructive":
      return "inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs";
    default:
      return "inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs";
  }
};

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}`;
  }
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
};

const Dashboard = () => {
  // Mock role - in real app, this would come from auth context
  const [userRole, setUserRole] = useState("tenant"); // "tenant" | "landlord"
  const [activeTab, setActiveTab] = useState(
    userRole === "tenant" ? "bookings" : "listings"
  );

  // Mock data for landlords
  const landlordListings = [
    {
      id: 1,
      title: "Modern Studio Apartment",
      location: "Downtown",
      price: 850,
      type: "Studio",
      status: "active",
    },
    {
      id: 2,
      title: "Cozy Private Room",
      location: "University District",
      price: 450,
      type: "Room",
      status: "active",
    },
    {
      id: 3,
      title: "Shared Apartment",
      location: "Riverside",
      price: 650,
      type: "Apartment",
      status: "occupied",
    },
  ];

  const landlordBookings = [
    {
      id: 1,
      property: "Modern Studio Apartment",
      tenant: "John Smith",
      date: "2024-01-15",
      status: "confirmed",
    },
    {
      id: 2,
      property: "Cozy Private Room",
      tenant: "Sarah Johnson",
      date: "2024-02-01",
      status: "pending",
    },
    {
      id: 3,
      property: "Shared Apartment",
      tenant: "Mike Wilson",
      date: "2024-01-20",
      status: "cancelled",
    },
  ];

  // Mock data for tenants
  const tenantBookings = [
    {
      id: 1,
      property: "Modern Studio Apartment",
      landlord: "Sarah Johnson",
      date: "2024-03-01",
      status: "confirmed",
      price: 850,
    },
    {
      id: 2,
      property: "Luxury Loft Downtown",
      landlord: "Michael Chen",
      date: "2024-03-15",
      status: "pending",
      price: 1200,
    },
  ];

  const savedProperties = [
    {
      id: 1,
      title: "Cozy Private Room",
      location: "University District",
      price: 450,
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
    },
    {
      id: 2,
      title: "Shared Apartment",
      location: "Riverside",
      price: 650,
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
    },
    {
      id: 3,
      title: "Budget Hostel Room",
      location: "City Center",
      price: 300,
      image:
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80",
    },
  ];

  const toggleRole = () => {
    const newRole = userRole === "tenant" ? "landlord" : "tenant";
    setUserRole(newRole);
    setActiveTab(newRole === "tenant" ? "bookings" : "listings");
  };

  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {userRole === "landlord"
                  ? "Landlord Dashboard"
                  : "Tenant Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {userRole === "landlord"
                  ? "Manage your properties and bookings"
                  : "View your bookings and saved properties"}
              </p>
            </div>
            {/* Role toggle for demo */}
            <button
              type="button"
              onClick={toggleRole}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card hover:bg-muted/10 transition"
            >
              Switch to {userRole === "tenant" ? "Landlord" : "Tenant"} View
            </button>
          </div>

          {/* Tab list */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex gap-2 mb-6 flex-wrap" role="tablist" aria-label="Dashboard tabs">
              {userRole === "landlord" ? (
                <>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "listings"}
                    id="landlord-tab-listings"
                    aria-controls="landlord-panel-listings"
                    className={`px-3 py-1 rounded ${
                      activeTab === "listings"
                        ? "bg-primary text-white"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("listings")}
                  >
                    My Listings
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "add"}
                    id="landlord-tab-add"
                    aria-controls="landlord-panel-add"
                    className={`px-3 py-1 rounded ${
                      activeTab === "add"
                        ? "bg-primary text-white"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("add")}
                  >
                    Add New Listing
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "bookings"}
                    id="landlord-tab-bookings"
                    aria-controls="landlord-panel-bookings"
                    className={`px-3 py-1 rounded ${
                      activeTab === "bookings"
                        ? "bg-primary text-white"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("bookings")}
                  >
                    Bookings
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "bookings"}
                    id="tenant-tab-bookings"
                    aria-controls="tenant-panel-bookings"
                    className={`px-3 py-1 rounded ${
                      activeTab === "bookings"
                        ? "bg-primary text-white"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("bookings")}
                  >
                    My Bookings
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "saved"}
                    id="tenant-tab-saved"
                    aria-controls="tenant-panel-saved"
                    className={`px-3 py-1 rounded ${
                      activeTab === "saved"
                        ? "bg-primary text-white"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("saved")}
                  >
                    Saved Properties
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "messages"}
                    id="tenant-tab-messages"
                    aria-controls="tenant-panel-messages"
                    className={`px-3 py-1 rounded ${
                      activeTab === "messages"
                        ? "bg-primary text-white"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("messages")}
                  >
                    Messages
                  </button>
                </>
              )}
            </div>

            {/* Landlord Views */}
            {userRole === "landlord" && activeTab === "listings" && (
              <section className="space-y-6" role="tabpanel" id="landlord-panel-listings" aria-labelledby="landlord-tab-listings">
                <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Your Properties</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage and edit your accommodation listings
                    </p>
                  </div>

                  <div className="p-4 overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="py-2">Title</th>
                          <th className="py-2">Location</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Price</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landlordListings.map((listing) => (
                          <tr key={listing.id} className="border-t">
                            <td className="py-3 font-medium">
                              {listing.title}
                            </td>
                            <td className="py-3">{listing.location}</td>
                            <td className="py-3">{listing.type}</td>
                            <td className="py-3">{`${formatCurrency(listing.price)}/mo`}</td>
                            <td className="py-3">
                              <span
                                className={getBadgeClasses(
                                  listing.status === "active"
                                    ? "default"
                                    : "secondary"
                                )}
                              >
                                {listing.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-muted/10"
                                  aria-label="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-muted/10"
                                  aria-label="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-muted/10 text-red-600"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {userRole === "landlord" && activeTab === "add" && (
              <section role="tabpanel" id="landlord-panel-add" aria-labelledby="landlord-tab-add">
                <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Add New Property
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fill in the details to list a new accommodation
                  </p>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium mb-1"
                        >
                          Property Title
                        </label>
                        <input
                          id="title"
                          className="w-full h-10 px-3 border border-border rounded"
                          placeholder="e.g., Modern Studio Apartment"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="type"
                          className="block text-sm font-medium mb-1"
                        >
                          Property Type
                        </label>
                        <select
                          id="type"
                          className="w-full h-10 px-3 border border-border rounded"
                        >
                          <option value="">Select type</option>
                          <option value="room">Room</option>
                          <option value="apartment">Apartment</option>
                          <option value="hostel">Hostel</option>
                          <option value="studio">Studio</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium mb-1"
                        >
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <input
                            id="location"
                            className="w-full h-10 px-10 border border-border rounded"
                            placeholder="City, Area"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="price"
                          className="block text-sm font-medium mb-1"
                        >
                          Price per Month
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <input
                            id="price"
                            type="number"
                            className="w-full h-10 px-10 border border-border rounded"
                            placeholder="850"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={5}
                        className="w-full p-3 border border-border rounded"
                        placeholder="Describe your property, amenities, and what makes it special..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Property Images
                      </label>
                      <input
                        id="property-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                      />
                      <label htmlFor="property-images" className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop images here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload up to 10 images (JPG, PNG, max 5MB each)
                        </p>
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded"
                      >
                        <Plus className="h-4 w-4" /> Publish Listing
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded"
                      >
                        Save as Draft
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {userRole === "landlord" && activeTab === "bookings" && (
              <section className="space-y-6" role="tabpanel" id="landlord-panel-bookings" aria-labelledby="landlord-tab-bookings">
                <div className="bg-white rounded-lg border border-border shadow-sm p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Booking Management
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage your property bookings
                  </p>

                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="py-2">Property</th>
                          <th className="py-2">Tenant</th>
                          <th className="py-2">Booking Date</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landlordBookings.map((booking) => (
                          <tr key={booking.id} className="border-t">
                            <td className="py-3 font-medium">
                              {booking.property}
                            </td>
                            <td className="py-3">{booking.tenant}</td>
                            <td className="py-3">{formatDate(booking.date)}</td>
                            <td className="py-3">
                              <span
                                className={getBadgeClasses(
                                  booking.status === "confirmed"
                                    ? "default"
                                    : booking.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                )}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                {booking.status === "pending" && (
                                  <>
                                    <button type="button" className="px-3 py-1 rounded border">
                                      Approve
                                    </button>
                                    <button type="button" className="px-3 py-1 rounded border">
                                      Reject
                                    </button>
                                  </>
                                )}
                                {booking.status === "confirmed" && (
                                  <button type="button" className="px-3 py-1 rounded border">
                                    View Details
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Tenant Views */}
            {userRole === "tenant" && activeTab === "bookings" && (
              <section className="space-y-6" role="tabpanel" id="tenant-panel-bookings" aria-labelledby="tenant-tab-bookings">
                <div className="bg-white rounded-lg border border-border shadow-sm p-4">
                  <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage your accommodation bookings
                  </p>

                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="py-2">Property</th>
                          <th className="py-2">Landlord</th>
                          <th className="py-2">Move-in Date</th>
                          <th className="py-2">Price</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenantBookings.map((booking) => (
                          <tr key={booking.id} className="border-t">
                            <td className="py-3 font-medium">
                              {booking.property}
                            </td>
                            <td className="py-3">{booking.landlord}</td>
                            <td className="py-3">{formatDate(booking.date)}</td>
                            <td className="py-3">{`${formatCurrency(booking.price)}/mo`}</td>
                            <td className="py-3">
                              <span
                                className={getBadgeClasses(
                                  booking.status === "confirmed"
                                    ? "default"
                                    : booking.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                )}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button type="button" className="px-3 py-1 rounded border">
                                  View Details
                                </button>
                                {booking.status === "pending" && (
                                  <button type="button" className="px-3 py-1 rounded border text-red-600">
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {userRole === "tenant" && activeTab === "saved" && (
              <section role="tabpanel" id="tenant-panel-saved" aria-labelledby="tenant-tab-saved">
                <div className="bg-white rounded-lg border border-border shadow-sm p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Saved Properties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                      <div
                        key={property.id}
                        className="bg-card rounded-lg overflow-hidden border border-border shadow-sm"
                      >
                        <div className="relative h-48">
                          <img
                            src={property.image}
                            alt={property.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 p-2 rounded bg-white/80 hover:bg-white"
                            aria-label="Toggle saved"
                          >
                            <Heart className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1">
                            {property.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {property.location}
                          </p>
                          <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-primary">
                          {formatCurrency(property.price)}
                          <span className="text-sm text-muted-foreground">
                          /mo
                          </span>
                          </p>
                          <Link
                              to={`/listing/${property.id}`}
                              className="px-3 py-1 rounded border"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {userRole === "tenant" && activeTab === "messages" && (
              <section role="tabpanel" id="tenant-panel-messages" aria-labelledby="tenant-tab-messages">
                <div className="bg-white rounded-lg border border-border shadow-sm p-8 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation by contacting a landlord from their
                    property listing
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
