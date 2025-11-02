import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Mail, Lock, User, Chrome, AlertCircle } from "lucide-react";
import useAuthStore from "../stores/auth";

const Auth = () => {
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [role, setRole] = useState("tenant");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading, error } = useAuthStore();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (error) {
      // Clear error after 5 seconds
      const timer = setTimeout(() => useAuthStore.setState({ error: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("login-email");
    const password = fd.get("login-password");

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("signup-name");
    const email = fd.get("signup-email");
    const password = fd.get("signup-password");
    const userRole = fd.get("role") || "tenant";

    const result = await register(name, email, password, userRole);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const continueWithGoogle = () => {
    console.log("Continue with Google clicked");
    // TODO: trigger OAuth flow
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <Home className="h-8 w-8 text-accent" aria-hidden="true" />
              <span className="text-2xl font-bold text-primary">
                StayFinder
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground">
              {tab === "login"
                ? "Sign in to your account"
                : "Fill in your details to get started"}
            </p>
          </div>

          <div className="w-full bg-card rounded-lg shadow p-6">
            <div className="flex gap-1 bg-muted/10 rounded-md overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => setTab("login")}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  tab === "login"
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-muted/20"
                }`}
                aria-pressed={tab === "login"}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  tab === "signup"
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-muted/20"
                }`}
                aria-pressed={tab === "signup"}
              >
                Sign Up
              </button>
            </div>

            {tab === "login" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="login-email"
                      name="login-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="pl-10 h-12 w-full px-3 rounded-md border border-border bg-input text-foreground focus:outline-none"
                      aria-label="Email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="login-password"
                      name="login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="pl-10 h-12 w-full px-3 rounded-md border border-border bg-input text-foreground focus:outline-none"
                      aria-label="Password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      name="remember"
                      type="checkbox"
                      className="rounded"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary text-white text-sm font-medium hover:opacity-95 transition"
                >
                  Sign In
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={continueWithGoogle}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-border bg-transparent text-sm"
                >
                  <Chrome className="h-4 w-4" aria-hidden="true" />
                  Continue with Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      required
                      placeholder="John Doe"
                      className="pl-10 h-12 w-full px-3 rounded-md border border-border bg-input text-foreground focus:outline-none"
                      aria-label="Full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="pl-10 h-12 w-full px-3 rounded-md border border-border bg-input text-foreground focus:outline-none"
                      aria-label="Email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="signup-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="pl-10 h-12 w-full px-3 rounded-md border border-border bg-input text-foreground focus:outline-none"
                      aria-label="Password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    I am a
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-12 w-full px-3 rounded-md border border-border bg-input text-foreground"
                    aria-label="Role"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:opacity-95 transition"
                >
                  Create Account
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={continueWithGoogle}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-border bg-transparent text-sm"
                >
                  <Chrome className="h-4 w-4" aria-hidden="true" />
                  Continue with Google
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-md text-white space-y-6">
            <h2 className="text-4xl font-bold">Find Your Perfect Stay</h2>
            <p className="text-lg text-white/90">
              Join thousands of tenants and landlords connecting through
              StayFinder. Your ideal accommodation is just a few clicks away.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <div>
                  <h3 className="font-semibold">Verified Listings</h3>
                  <p className="text-sm text-white/80">
                    All properties are verified by our team
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <div>
                  <h3 className="font-semibold">Secure Booking</h3>
                  <p className="text-sm text-white/80">
                    Safe and secure payment processing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <h3 className="font-semibold">Trusted Community</h3>
                  <p className="text-sm text-white/80">
                    Real reviews from real tenants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
