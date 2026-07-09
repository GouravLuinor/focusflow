import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center bg-[#FAF9F7] text-[#1A1A1A] font-sans py-12 overflow-hidden select-none">
      {/* Decorative Corner Blurs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4F46E5]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#4F46E5]/05 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none z-0" />

      {/* Main Container */}
      <main className="w-full max-w-[440px] px-6 md:px-0 relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="transition-transform duration-500 hover:scale-105 mb-6">
          <img
            alt="FocusFlow Logo"
            className="w-12 h-12 rounded-md object-contain"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvVfnOLfeDZEmOnoQeBs7a-e_TxAnhN77g7L8_qQv7YqZCfP09RPZr9FxiQ31hxPyS5NXL_QlTDHGwD7wyNpRB4C0P9fX6lsrzrb38m5pGlnTyeXFeqA4bq_lPgMnaUG6Bp5qGAY2Gg6V3eBkAWJcmsvRCX9uP23gGHP-jg9C1y37nDxyoCt3txJsGTZsy8BZYEE9ZU1xP4VuC7QilIEj3comtmtwPb0aeN8zYg4nuTNmIxJ6PGykkTT3c"
          />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-xl border border-[#E8E6E1] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#1A1A1A] mb-2 leading-[1.4] font-sans">
              {title}
            </h1>
            <p className="text-[16px] text-[#6B6660] font-sans leading-[1.6]">
              {subtitle}
            </p>
          </header>

          {/* Form and Children */}
          {children}
        </div>

        {/* Legal Footer */}
        <p className="mt-8 text-[12px] text-[#9E988E] opacity-60 text-center font-sans">
          © {new Date().getFullYear()} FocusFlow. Calm productivity for everyone.
        </p>
      </main>
    </div>
  );
}
