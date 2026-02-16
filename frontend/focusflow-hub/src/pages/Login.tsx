import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, onboardingComplete, supportMode } = useApp();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    toast({
      title: "Missing information",
      description: "Please fill in all fields",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    // 🔥 REAL BACKEND LOGIN
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // 🔥 STORE TOKEN
    localStorage.setItem('token', data.access_token);

    // 🔥 GET USER
    const user = await apiRequest('/auth/me');
    setUser(user);

    toast({
      title: "Welcome back 👋",
      description: "Login successful",
    });

    navigate('/onboarding'); // or dashboard depending on flow

  } catch (err: any) {
    toast({
      title: "Login failed",
      description: err.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-medium">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 rounded-xl border-border/60 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 rounded-xl border-border/60 focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-calm text-primary-foreground font-semibold text-lg shadow-glow hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>

        <div className="text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
