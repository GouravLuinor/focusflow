import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    api?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const authData = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", authData.access_token);
      const user = await apiRequest("/auth/me");
      setUser(user);
      navigate("/onboarding");
    } catch (err) {
      setErrors({
        api: err instanceof Error ? err.message : "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start building calm, adaptive workflows"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.api && (
          <div className="flex items-center gap-2 text-destructive text-xs py-1.5 font-sans bg-destructive/10 p-2.5 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.api}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground font-sans" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Alex Mercer"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground font-sans" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            placeholder="alex@example.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground font-sans" htmlFor="password">
            Password (8+ characters)
          </label>
          <input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm py-3.5 rounded-xl mt-2 transition-all duration-150 active:scale-[0.98] flex justify-center items-center font-sans shadow-glow-vermilion disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Card Footer Link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground font-sans">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
