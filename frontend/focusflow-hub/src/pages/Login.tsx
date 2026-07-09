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
      // 1. Call real backend login endpoint
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // 2. Store session token
      localStorage.setItem("token", data.access_token);

      // 3. Fetch authenticated user profile
      const user = await apiRequest("/auth/me");
      setUser(user);

      // 4. Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#6B6660] font-sans" htmlFor="email">
            Email
          </label>
          <input
            className={`w-full bg-white border ${
              error && !email ? "border-[#D97706] focus:ring-[#D97706] focus:border-[#D97706]" : "border-[#E8E6E1] focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            } rounded-lg p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9E988E] outline-none transition-all duration-200 focus:ring-2`}
            id="email"
            name="email"
            placeholder="alex@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[12px] font-medium text-[#6B6660] font-sans" htmlFor="password">
              Password
            </label>
            <a
              className="text-[14px] text-[#6B6660] hover:underline transition-all font-sans"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          </div>
          <input
            className={`w-full bg-white border ${
              error && !password ? "border-[#D97706] focus:ring-[#D97706] focus:border-[#D97706]" : "border-[#E8E6E1] focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            } rounded-lg p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9E988E] outline-none transition-all duration-200 focus:ring-2`}
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-[#D97706] text-[14px] py-2 font-sans">
            <AlertCircle className="h-[18px] w-[18px]" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full bg-[#4F46E5] text-white font-medium text-[18px] py-4 rounded-lg mt-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center font-sans disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Card Footer Link */}
      <div className="mt-8 text-center">
        <p className="text-[14px] text-[#6B6660] font-sans">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#4F46E5] font-medium hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
