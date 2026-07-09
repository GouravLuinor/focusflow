interface FocusTaskHeaderProps {
  title: string;
  goalTitle?: string;
  priority: string;
}

export function FocusTaskHeader({ title, goalTitle, priority }: FocusTaskHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-3">
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#eae6f4] border border-[#E8E6E1] gap-1.5 mb-2 font-sans">
        <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
        <span className="text-[12px] font-medium text-[#6B6660] tracking-wide">
          {priority}
        </span>
      </div>
      <h1 className="text-[32px] font-semibold text-[#1A1A1A] leading-tight font-sans text-center">
        {title}
      </h1>
      {goalTitle && (
        <p className="text-[16px] text-[#9E988E] font-sans text-center">
          {goalTitle}
        </p>
      )}
    </header>
  );
}
