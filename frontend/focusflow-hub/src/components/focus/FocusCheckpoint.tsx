interface FocusCheckpointProps {
  checkpoint: string;
  completedCount: number;
  totalCount: number;
}

export function FocusCheckpoint({ checkpoint, completedCount, totalCount }: FocusCheckpointProps) {
  return (
    <section className="w-full bg-white border border-[#E8E6E1] rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden">
      {/* Status Strip (Left Aligned) */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4F46E5] rounded-l-lg"></div>
      <p className="text-[16px] text-[#1A1A1A] text-left pl-2 font-sans leading-relaxed">
        Current: {checkpoint}
      </p>
      <p className="text-[14px] text-[#9E988E] text-left pl-2 font-sans">
        {completedCount} of {totalCount} checkpoints
      </p>
    </section>
  );
}
