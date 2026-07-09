interface GreetingHeaderProps {
  name: string;
  availableMinutes: number;
  isEmpty?: boolean;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function GreetingHeader({ name, availableMinutes, isEmpty = false }: GreetingHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const firstName = name?.split(' ')[0] ?? 'there';

  if (isEmpty) {
    return (
      <header className="flex flex-col gap-2 mb-8">
        <h1 className="text-[40px] font-semibold text-[#1b1b24] tracking-tight leading-none">
          Good {timeOfDay}, {firstName}
        </h1>
        <p className="text-[16px] text-[#9E988E] leading-normal">
          Here's your empty slate. Let's get things organized.
        </p>
      </header>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-[32px] font-semibold text-[#1A1A1A] tracking-tight mb-1 leading-tight">
        Good {timeOfDay}, {firstName}
      </h2>
      <p className="text-[16px] text-[#6B6660] leading-normal">
        You have {availableMinutes} minutes available today
      </p>
    </div>
  );
}
