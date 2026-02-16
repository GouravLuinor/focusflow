import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface ZenButtonProps {
  isZenMode: boolean;
  onToggle: () => void;
}

export function ZenButton({ isZenMode, onToggle }: ZenButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
        isZenMode
          ? 'bg-autism-primary text-white'
          : 'bg-card border border-autism-primary/30 text-autism-primary hover:bg-autism-primary/10'
      }`}
    >
      <Leaf className="w-5 h-5" />
      <span>{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
    </motion.button>
  );
}
