import { CheckCircle2, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatsProps {
  completedCount: number;
  focusMinutes: number;
  dayStreak: number;
}

export function QuickStats({ completedCount, focusMinutes, dayStreak }: QuickStatsProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const stats = [
    {
      label: 'completed',
      value: String(completedCount),
      icon: CheckCircle2,
    },
    {
      label: 'focus time',
      value: formatTime(focusMinutes),
      icon: Clock,
    },
    {
      label: 'day streak',
      value: String(dayStreak),
      icon: Flame,
    },
  ];

  return (
    <section className="mt-auto pt-8">
      <h3 className="text-[12px] font-medium text-[#9E988E] uppercase tracking-wider mb-4 font-sans">
        Quick Stats
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 + 0.05 * i }}
            className="bg-white rounded-xl border border-[#E8E6E1] p-4 flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.01] transition-transform duration-200"
          >
            <stat.icon className="w-5 h-5 text-[#9E988E] mb-2 shrink-0" />
            <span className="text-[20px] font-semibold text-[#1A1A1A] font-sans leading-tight">
              {stat.value}
            </span>
            <span className="text-[12px] font-medium text-[#6B6660] mt-1 font-sans leading-none">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
