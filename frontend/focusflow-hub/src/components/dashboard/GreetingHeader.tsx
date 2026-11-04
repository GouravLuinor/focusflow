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
        <h1 className="text-[40px] font-semibold text-foreground tracking-tight leading-none">
          Good {timeOfDay}, {firstName}
        </h1>
        <p className="text-[16px] text-muted-foreground leading-normal">
          Here's your empty slate. Let's get things organized.
        </p>
      </header>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-[32px] font-semibold text-foreground tracking-tight mb-1 leading-tight">
        Good {timeOfDay}, {firstName}
      </h2>
      <div className="text-[16px] text-muted-foreground leading-normal flex items-center gap-1.5 flex-wrap">
        <span>You have</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={1440}
              aria-label="Minutes available today"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-16 px-1.5 py-0.5 border border-primary rounded bg-card text-foreground outline-none text-center text-[14px]"
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <span className="text-[12px] text-primary dark:text-primary font-semibold cursor-pointer" onClick={handleSave}>
              Save
            </span>
          </div>
        ) : (
          <span 
            onClick={() => setIsEditing(true)} 
            className="font-semibold text-primary dark:text-primary underline decoration-dotted cursor-pointer hover:text-primary/90 dark:hover:text-indigo-300 transition-colors"
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
