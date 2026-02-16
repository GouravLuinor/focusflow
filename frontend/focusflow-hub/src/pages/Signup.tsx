import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';


export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name || !email || !password) {
    toast({
      title: "Missing information",
      description: "Please fill in all fields",
      variant: "destructive",
    });
    return;
  }

  if (password.length < 8) {
    toast({
      title: "Weak password",
      description: "Password must be at least 8 characters",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    // 🔹 REAL BACKEND CALL
    const user = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    // Save user in app context
    setUser(user);

    toast({
      title: "Account created! 🎉",
      description: "Please login to continue",
    });

    // Redirect to login instead of onboarding (better flow)
    navigate('/login');

  } catch (err: any) {
    toast({
      title: "Signup failed",
      description: err.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <AuthLayout
      title="Join us"
      subtitle="Create your personalized support experience"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground font-medium">
            Your name
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="What should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-12 h-12 rounded-xl border-border/60 focus:border-primary transition-colors"
            />
          </div>
        </div>

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
              placeholder="Create a strong password"
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
          
          {/* Password requirements */}
          <div className="pt-2 space-y-1">
            {passwordRequirements.map((req, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 text-sm ${
                  req.met ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  req.met ? 'bg-success' : 'bg-border'
                }`}>
                  {req.met && <Check className="w-3 h-3 text-success-foreground" />}
                </div>
                {req.text}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="pt-2"
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
                Create account
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>

        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
