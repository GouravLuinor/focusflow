interface GoalSettingsProps {
  status: string;
  priority: string;
  deadline: string;
}

export function GoalSettings({ status, priority, deadline }: GoalSettingsProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E6E1] p-5 font-sans">
      <h2 className="text-[20px] font-medium text-[#1A1A1A] mb-4">Goal Settings</h2>
      <div className="space-y-4 text-[14px]">
        {/* Status */}
        <div className="flex justify-between items-center border-b border-[#E8E6E1] pb-2">
          <span className="text-[#6B6660]">Status</span>
          <span className="bg-[#4F46E5]/10 text-[#4F46E5] px-2 py-1 rounded-md text-[12px] font-medium">
            {status}
          </span>
        </div>

        {/* Priority */}
        <div className="flex justify-between items-center border-b border-[#E8E6E1] pb-2">
          <span className="text-[#6B6660]">Priority</span>
          <span className="text-[#1A1A1A] font-medium">{priority}</span>
        </div>

        {/* Deadline */}
        <div className="flex justify-between items-center">
          <span className="text-[#6B6660]">Deadline</span>
          <span className="text-[#1A1A1A]">{deadline}</span>
        </div>
      </div>
    </div>
  );
}
