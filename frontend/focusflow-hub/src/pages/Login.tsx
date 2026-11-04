import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", data.access_token);
      const user = await apiRequest("/auth/me");
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue your focus flow">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground font-sans" htmlFor="email">
            Email address
          </label>
          <input
            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
            id="email"
            name="email"
            placeholder="alex@example.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-muted-foreground font-sans" htmlFor="password">
              Password
            </label>
          </div>
          <input
            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs py-1.5 font-sans bg-destructive/10 p-2.5 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm py-3.5 rounded-xl mt-2 transition-all duration-150 active:scale-[0.98] flex justify-center items-center font-sans shadow-glow-vermilion disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Card Footer Link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground font-sans">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
