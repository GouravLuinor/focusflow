import { Link, Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

export default function Landing() {
  const { isAuthenticated } = useApp();

  // If already authenticated, redirect to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden bg-[#FAF9F7] text-[#1A1A1A] font-sans">
      {/* Self-contained CSS for animations respecting prefers-reduced-motion */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}} />

      {/* Decorative blurs in top-left and bottom-right corners */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.07)_0%,transparent_70%)] blur-2xl pointer-events-none -translate-x-1/4 -translate-y-1/4 z-0" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.06)_0%,transparent_70%)] blur-2xl pointer-events-none translate-x-1/4 translate-y-1/4 z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-12 md:px-8">
        <div className="w-full max-w-[600px] flex flex-col items-center text-center space-y-10">
          
          {/* Logo Header */}
          <header className="flex flex-col items-center gap-3 fade-in-up">
            <img
              alt="FocusFlow Logo"
              className="w-12 h-12 object-contain rounded-md shadow-sm"
              src="https://lh3.googleusercontent.com/aida/AP1WRLvVfnOLfeDZEmOnoQeBs7a-e_TxAnhN77g7L8_qQv7YqZCfP09RPZr9FxiQ31hxPyS5NXL_QlTDHGwD7wyNpRB4C0P9fX6lsrzrb38m5pGlnTyeXFeqA4bq_lPgMnaUG6Bp5qGAY2Gg6V3eBkAWJcmsvRCX9uP23gGHP-jg9C1y37nDxyoCt3txJsGTZsy8BZYEE9ZU1xP4VuC7QilIEj3comtmtwPb0aeN8zYg4nuTNmIxJ6PGykkTT3c"
            />
            <h1 className="text-xl font-semibold text-[#4F46E5] tracking-tight font-sans">
              FocusFlow
            </h1>
          </header>

          {/* Hero Content */}
          <section className="flex flex-col items-center space-y-6 w-full">
            <div className="space-y-4 fade-in-up delay-100">
              <h2 className="text-[40px] font-semibold text-[#1A1A1A] leading-tight font-sans">
                One thing at a time.
              </h2>
              <p className="text-[18px] text-[#6B6660] mx-auto max-w-[450px] font-medium leading-relaxed font-sans">
                An adaptive workflow platform designed for the way your mind works.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 fade-in-up delay-200">
              <span className="px-4 py-2 bg-[#f0ecf9] rounded-full text-[12px] font-medium leading-[1.2] text-[#464555] border border-[#E8E6E1]">
                Smart scheduling
              </span>
              <span className="px-4 py-2 bg-[#f0ecf9] rounded-full text-[12px] font-medium leading-[1.2] text-[#464555] border border-[#E8E6E1]">
                Dependency-aware workflows
              </span>
              <span className="px-4 py-2 bg-[#f0ecf9] rounded-full text-[12px] font-medium leading-[1.2] text-[#464555] border border-[#E8E6E1]">
                Neuro-inclusive design
              </span>
            </div>
          </section>

          {/* Abstract Illustration */}
          <div aria-hidden="true" className="w-full max-w-sm h-32 flex items-center justify-center fade-in-up delay-200">
            <svg className="w-full h-full opacity-60" fill="none" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
              <circle className="fill-[#4F46E5]" fillOpacity={0.1} cx="50" cy="50" r="30" />
              <rect className="fill-[#e4e1ee]" height="40" rx="8" width="40" x="90" y="30" />
              <path className="fill-[#ffb695]" fillOpacity={0.2} d="M150 70 L170 30 L190 70 Z" />
              <path className="stroke-[#E8E6E1]" d="M50 50 C 90 20, 110 80, 170 50" fill="none" strokeDasharray="4 4" strokeWidth="2" />
            </svg>
          </div>

          {/* CTA & Sign In Link */}
          <section className="flex flex-col items-center w-full space-y-4 fade-in-up delay-300">
            <Link to="/signup" className="w-full sm:w-auto">
              <button
                className="w-full px-8 py-4 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-100 shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 focus:ring-offset-[#FAF9F7]"
              >
                Get Started
              </button>
            </Link>
            <p className="text-sm text-[#6B6660] font-sans">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#4F46E5] hover:text-[#4F46E5]/90 font-medium underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 flex justify-center fade-in-up delay-300">
        <span className="text-xs text-[#9E988E] font-medium tracking-wider">FocusFlow</span>
      </footer>
    </div>
  );
}
