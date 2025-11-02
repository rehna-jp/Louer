import { Home, User, Menu, LogOut } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-8 w-8 text-accent" aria-hidden="true" />
            <span className="text-2xl font-bold text-primary">StayFinder</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/10 transition-colors"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium hover:opacity-95 transition"
                >
                  Sign Up
                </Link>
              </>
            )}

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-muted/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
