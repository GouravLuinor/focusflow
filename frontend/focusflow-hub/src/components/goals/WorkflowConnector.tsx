import { ChevronDown } from 'lucide-react';

interface WorkflowConnectorProps {
  hasChevron?: boolean;
}

export function WorkflowConnector({ hasChevron = true }: WorkflowConnectorProps) {
  if (!hasChevron) {
    return (
      <div className="w-full flex justify-center -my-3 z-0 relative pointer-events-none">
        <div className="h-6 w-px bg-border"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center -my-3 z-0 relative pointer-events-none text-border">
      <div className="h-6 w-px bg-border"></div>
      <ChevronDown className="w-[16px] h-[16px] -mt-2 text-border shrink-0" />
    </div>
  );
}
