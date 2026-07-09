import { motion } from 'framer-motion';

interface ScheduleEmptyStateProps {
  onGenerate: () => void;
  onAddManual: () => void;
}

export function ScheduleEmptyState({ onGenerate, onAddManual }: ScheduleEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-md w-full bg-white border border-[#E8E6E1] rounded-xl p-8 flex flex-col items-center text-center shadow-sm font-sans"
    >
      {/* Abstract calm SVG illustration */}
      <div className="w-48 h-48 mb-6 text-[#4F46E5] opacity-80 flex items-center justify-center shrink-0">
        <svg className="w-full h-full" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z"
            fill="currentColor"
            fillOpacity="0.1"
          ></path>
          <path
            d="M140 100C140 122.091 122.091 140 100 140C77.9086 140 60 122.091 60 100C60 77.9086 77.9086 60 100 60"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="8"
          ></path>
          <circle cx="85" cy="90" fill="currentColor" r="6"></circle>
          <circle cx="115" cy="90" fill="currentColor" r="6"></circle>
          <path
            d="M90 115C95 120 105 120 110 115"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="6"
          ></path>
        </svg>
      </div>

      <h2 className="text-[24px] font-medium text-[#1A1A1A] mb-2">
        No sessions planned yet
      </h2>
      <p className="text-[14px] text-[#6B6660] mb-8 max-w-sm leading-relaxed">
        Take a moment to map out your day. FocusFlow helps you break down work into manageable blocks.
      </p>

      <button
        onClick={onGenerate}
        className="w-full bg-[#4F46E5] hover:bg-[#4338ca] text-white py-3 px-6 rounded-lg font-medium mb-4 transition-colors duration-200 text-[18px] shadow-sm hover:shadow-md"
      >
        Generate your first daily plan
      </button>
      <button
        onClick={onAddManual}
        className="text-[14px] text-[#4F46E5] hover:text-[#3323cc] transition-colors underline-offset-4 hover:underline cursor-pointer bg-transparent border-none font-medium"
      >
        Or add a manual focus block
      </button>
    </motion.div>
  );
}
