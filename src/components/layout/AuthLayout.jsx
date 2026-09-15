import vayzoLogo from "../../assets/logo/Vayzo_logo.png";
import vayzoLoginBg from "../../assets/loginpage.png";
import { ShieldCheck } from "lucide-react";

const AuthLayout = ({ children }) => {
  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-background p-0 sm:p-6">
      <div className="flex h-full w-full max-h-none flex-col overflow-hidden bg-surface shadow-xl sm:max-h-[550px] sm:max-w-4xl sm:flex-row sm:rounded-2xl">
        
        {/* Left Panel - Image Area */}
        <section className="relative hidden w-full flex-shrink-0 items-center justify-center overflow-hidden bg-gray-50 sm:flex sm:h-full sm:w-[45%]">
          <img 
            src={vayzoLoginBg} 
            alt="VAYZO Admin Portal" 
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>

        {/* Right Panel - Content Area */}
        <section className="relative flex h-full flex-1 flex-col items-center justify-center bg-[#fafbff] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 overflow-hidden">
          
          {/* Main Auth Content (Centered vertically in available space) */}
          <div className="flex w-full max-w-[360px] flex-1 flex-col justify-center">
            <div className="w-full rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              {children}
            </div>
          </div>

          {/* Fixed Footer Area */}
          <div className="mt-4 w-full max-w-[360px] flex-shrink-0 pb-1">
            <p className="flex items-center justify-center gap-2 text-center text-xs text-subtle">
              <ShieldCheck size={14} className="text-success" />
              Your connection is secure and encrypted
            </p>
            <p className="mt-2 text-center text-[10px] text-subtle">
              © 2026 VAYZO. All rights reserved.
            </p>
          </div>

        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
