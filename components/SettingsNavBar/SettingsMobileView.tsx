'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type NavItem = {
  text: string;
  subText: string;
  settingIcon: ReactNode;
  url: string;
};

type Props = {
  items: NavItem[];
  activeMenu: string;
};

export default function SettingsMobileView({ items, activeMenu }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const current = items.find(
    (item) => item.text.toLowerCase().replaceAll(' ', '_') === activeMenu.toLowerCase().replaceAll(' ', '_'),
  ) ?? items[0];

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (url: string) => {
    router.push(`/settings/${url}`);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-white border-b border-gray-200 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="text-gray-500 flex-shrink-0">{current?.settingIcon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-gray-900 truncate">{current?.text}</span>
          <span className="block text-xs text-gray-400">{current?.subText}</span>
        </span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full bg-white rounded-t-2xl pb-7"
            style={{ animation: 'smn-slide-up 0.26s cubic-bezier(0.32,0.72,0,1)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings navigation"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

            {items.map((item) => {
              const isActive = item.text.toLowerCase().replaceAll(' ', '_')
                === activeMenu.toLowerCase().replaceAll(' ', '_');
              return (
                <button
                  key={item.text}
                  onClick={() => handleSelect(item.text.toLowerCase().replaceAll(' ', '_'))}
                  className={`flex items-center gap-3 w-[calc(100%-16px)] mx-2 px-4 py-3 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                    {item.settingIcon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">{item.text}</span>
                    <span className={`block text-xs ${isActive ? 'text-teal-500' : 'text-gray-400'}`}>
                      {item.subText}
                    </span>
                  </span>
                  {isActive && (
                    <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <style>
            {`
            @keyframes smn-slide-up {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
          `}
          </style>
        </div>
      )}
    </>
  );
}
