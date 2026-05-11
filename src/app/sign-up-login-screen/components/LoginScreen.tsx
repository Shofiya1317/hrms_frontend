'use client';

import React, { useState } from 'react';
import BrandPanel from './BrandPanel';
import LoginForm from './LoginForm';
import { UserRole } from '@/contexts/AuthContext';

export type { UserRole };

export default function LoginScreen() {
  const [activeRole, setActiveRole] = useState<UserRole>('employee');

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Brand Panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-shrink-0">
        <BrandPanel activeRole={activeRole} />
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen px-6 py-10 sm:px-10 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo — only visible on small screens */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img
              src="/assets/images/ChatGPT_Image_Mar_20_2026_from_HRMS_System_Design-1773983355969.png"
              alt="Impactree Workflo logo — green tree icon with brand wordmark"
              className="h-10 w-auto object-contain"
            />
          </div>

          <LoginForm activeRole={activeRole} setActiveRole={setActiveRole} />
        </div>
      </div>
    </div>
  );
}
