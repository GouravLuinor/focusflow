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
      // 1. Call real backend signup API
      const user = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      // 2. Automatically log the user in to obtain a session token
      const authData = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // 3. Save token and user context
      localStorage.setItem("token", authData.access_token);
      setUser(user);

      // 4. Redirect to onboarding
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
    <AuthCard title="Create your account" subtitle="Start building better workflows">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Full Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#6B6660] font-sans" htmlFor="full-name">
            Full name
          </label>
          <input
            className={`w-full bg-white border ${
              errors.name ? "border-[#D97706] focus:ring-[#D97706] focus:border-[#D97706]" : "border-[#E8E6E1] focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            } rounded-lg p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9E988E] outline-none transition-all duration-200 focus:ring-2`}
            id="full-name"
            name="full-name"
            placeholder="Alex Johnson"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 text-[#D97706] mt-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[14px] font-normal font-sans leading-none">{errors.name}</span>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#6B6660] font-sans" htmlFor="email">
            Email
          </label>
          <input
            className={`w-full bg-white border ${
              errors.email ? "border-[#D97706] focus:ring-[#D97706] focus:border-[#D97706]" : "border-[#E8E6E1] focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            } rounded-lg p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9E988E] outline-none transition-all duration-200 focus:ring-2`}
            id="email"
            name="email"
            placeholder="alex@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <div className="flex items-center gap-1.5 text-[#D97706] mt-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[14px] font-normal font-sans leading-none">{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#6B6660] font-sans" htmlFor="password">
            Password
          </label>
          <input
            className={`w-full bg-white border ${
              errors.password ? "border-[#D97706] focus:ring-[#D97706] focus:border-[#D97706]" : "border-[#E8E6E1] focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            } rounded-lg p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9E988E] outline-none transition-all duration-200 focus:ring-2`}
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <div className="flex items-center gap-1.5 text-[#D97706] mt-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[14px] font-normal font-sans leading-none">{errors.password}</span>
            </div>
          )}
        </div>

        {/* API Error Box */}
        {errors.api && (
          <div className="flex items-center justify-center gap-2 text-[#D97706] text-[14px] py-2 font-sans">
            <AlertCircle className="h-[18px] w-[18px]" />
            <span>{errors.api}</span>
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
            "Create Account"
          )}
        </button>
      </form>

      {/* Card Footer Link */}
      <footer className="mt-8 text-center">
        <p className="text-[14px] text-[#6B6660] font-sans">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4F46E5] font-medium hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </footer>
    </AuthCard>
  );
}
