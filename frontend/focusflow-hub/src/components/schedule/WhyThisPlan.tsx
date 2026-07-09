import { Lightbulb, Clock, Flower2 } from 'lucide-react';

export function WhyThisPlan() {
  return (
    <div className="mt-8 font-sans">
      <h3 className="text-[20px] font-medium text-[#1A1A1A] mb-4">
        Why this plan?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1 */}
        <div className="bg-white border border-[#E8E6E1] p-4 rounded-xl flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-[#4F46E5] mt-1 shrink-0" />
          <p className="text-[14px] text-[#6B6660] leading-relaxed">
            SQL Joins is due in 2 days and unlocks Advanced Queries
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E8E6E1] p-4 rounded-xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#4F46E5] mt-1 shrink-0" />
          <p className="text-[14px] text-[#6B6660] leading-relaxed">
            Transaction Review fits your remaining available time
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#E8E6E1] p-4 rounded-xl flex items-start gap-3">
          <Flower2 className="w-5 h-5 text-[#4F46E5] mt-1 shrink-0" />
          <p className="text-[14px] text-[#6B6660] leading-relaxed">
            Short buffer added to prevent overload
          </p>
        </div>
      </div>
    </div>
  );
}
