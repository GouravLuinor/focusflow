import { useState, useEffect } from 'react';

interface GreetingHeaderProps {
  name: string;
  availableMinutes: number;
  isEmpty?: boolean;
  onMinutesChange?: (mins: number) => void;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function GreetingHeader({ name, availableMinutes, isEmpty = false, onMinutesChange }: GreetingHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const firstName = name?.split(' ')[0] ?? 'there';
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(availableMinutes));

  useEffect(() => {
    setInputValue(String(availableMinutes));
  }, [availableMinutes]);

  const handleSave = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onMinutesChange?.(parsed);
    }
    setIsEditing(false);
  };

  if (isEmpty) {
    return (
      <header className="flex flex-col gap-2 mb-8">
        <h1 className="text-[40px] font-semibold text-[#1b1b24] dark:text-dark-text-primary tracking-tight leading-none">
          Good {timeOfDay}, {firstName}
        </h1>
        <p className="text-[16px] text-[#9E988E] dark:text-dark-text-secondary leading-normal">
          Here's your empty slate. Let's get things organized.
        </p>
      </header>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-[32px] font-semibold text-[#1A1A1A] dark:text-dark-text-primary tracking-tight mb-1 leading-tight">
        Good {timeOfDay}, {firstName}
      </h2>
      <div className="text-[16px] text-[#6B6660] dark:text-dark-text-secondary leading-normal flex items-center gap-1.5 flex-wrap">
        <span>You have</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-16 px-1.5 py-0.5 border border-[#4F46E5] dark:border-dark-border rounded bg-white dark:bg-dark-background text-[#1A1A1A] dark:text-dark-text-primary outline-none text-center text-[14px]"
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <span className="text-[12px] text-[#4F46E5] dark:text-[#818cf8] font-semibold cursor-pointer" onClick={handleSave}>
              Save
            </span>
          </div>
        ) : (
          <span 
            onClick={() => setIsEditing(true)} 
            className="font-semibold text-[#4F46E5] dark:text-[#818cf8] underline decoration-dotted cursor-pointer hover:text-[#4338ca] dark:hover:text-indigo-300 transition-colors"
            title="Click to edit available minutes"
          >
            {availableMinutes} minutes
          </span>
        )}
        <span>available today</span>
      </div>
    </div>
  );
}
