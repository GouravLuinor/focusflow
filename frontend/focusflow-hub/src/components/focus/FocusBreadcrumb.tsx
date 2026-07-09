import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function FocusBreadcrumb() {
  const navigate = useNavigate();

  return (
    <nav aria-label="Global" className="absolute top-0 left-0 w-full p-6 md:p-8 bg-transparent flex items-center justify-start z-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-[#9E988E] hover:text-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 rounded font-sans"
      >
        <ArrowLeft className="w-[18px] h-[18px]" />
        <span className="text-[14px]">Back to Dashboard</span>
      </button>
    </nav>
  );
}
