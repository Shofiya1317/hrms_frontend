import React from 'react';

interface NotificationBadgeProps {
  count?: number;
  className?: string; // Optional classes to tweak positioning if needed
}

export default function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (!count || count <= 0) return null;

  return (
    <span
      className={`absolute flex items-center justify-center bg-red-500 text-white font-bold rounded-full shadow-sm ring-1 ring-white ${className}`}
      style={{
        top: '-4px',
        right: '-4px',
        height: '18px',
        minWidth: '18px',
        fontSize: '10px',
        padding: '0 4px',
        lineHeight: 1,
        transform: 'translate(25%, -25%)',
        zIndex: 10,
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
