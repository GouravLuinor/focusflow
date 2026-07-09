import { BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Insights() {
  return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 min-h-[calc(100vh-4rem)] bg-[#FAF9F7] font-sans">
        <div className="max-w-md w-full bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f0ecf9] flex items-center justify-center text-[#4F46E5]">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-[24px] font-semibold text-[#1A1A1A] mb-3">
            Insights coming soon
          </h2>
          <p className="text-[16px] text-[#6B6660] leading-relaxed">
            Track your productivity trends and focus patterns over time.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
