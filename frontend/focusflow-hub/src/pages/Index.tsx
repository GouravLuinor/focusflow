import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Heart, BookOpen, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Zap,
    title: 'ADHD Support',
    description: 'Timers, progress bars, and dopamine-boosting rewards',
    color: 'from-adhd-primary to-adhd-secondary',
  },
  {
    icon: Heart,
    title: 'Autism Support',
    description: 'Clean interfaces, Zen mode, and predictable patterns',
    color: 'from-autism-primary to-autism-secondary',
  },
  {
    icon: BookOpen,
    title: 'Dyslexia Support',
    description: 'Readable fonts, generous spacing, and high contrast',
    color: 'from-dyslexia-primary to-dyslexia-secondary',
  },
];

const benefits = [
  'One task at a time - no overwhelm',
  'Personalized interface for your brain',
  'Accessibility settings you control',
  'Celebrate every small win',
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16">
          {/* Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-calm flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FocusFlow</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-calm text-primary-foreground shadow-glow hover:shadow-lg transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.nav>

          {/* Hero content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Built for neurodivergent minds</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Focus your way.
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                One step at a time.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              A task management app designed specifically for ADHD, Autism, and Dyslexia. 
              Choose your support mode and experience productivity that works with your brain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate('/signup')}
                  className="h-14 px-8 text-lg bg-gradient-calm text-primary-foreground shadow-glow hover:shadow-lg transition-all rounded-2xl"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="h-14 px-8 text-lg rounded-2xl border-2"
                >
                  I have an account
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Three modes. One goal.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the interface that matches how your brain works best.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-3xl p-8 border border-border/50 card-interactive"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-soft`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Designed to reduce overwhelm
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Traditional task apps throw everything at you at once. FocusFlow shows you 
                one thing at a time, with big clear buttons and encouraging feedback.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-4 h-4 text-success-foreground" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Preview card mockup */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-border/50 shadow-medium">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
                    <span className="text-sm font-medium text-primary">Step 1 of 5</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Take a deep breath</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your session with 3 deep breaths to center yourself
                  </p>
                  <div className="w-full py-4 bg-gradient-calm text-primary-foreground rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Done! Next step
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-calm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to focus your way?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Join thousands who have found their flow with FocusFlow.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => navigate('/signup')}
                className="h-14 px-10 text-lg bg-card text-foreground hover:bg-card/90 shadow-lg rounded-2xl"
              >
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built with ❤️ for neurodivergent minds
          </p>
        </div>
      </footer>
    </div>
  );
}
