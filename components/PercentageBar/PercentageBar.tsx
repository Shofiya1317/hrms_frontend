'use client';

import { useEffect, useState, useMemo } from 'react';

interface PercentageBarProps {
  value: number;
  prefixValueShown?: boolean;
  suffixValueShown?: boolean;
}

const getProgressColor = (value: number) => {
  if (value === 100) return '#00A944';
  if (value > 25) return '#F59E0B';
  return '#E92626';
};

const PercentageBar: React.FC<PercentageBarProps> = ({
  value,
  prefixValueShown,
  suffixValueShown,
}) => {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompleted(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const progressColor = useMemo(() => getProgressColor(value), [value]);

  return (
    <div className="flex items-center gap-2 w-full">
      {prefixValueShown && (
        <span className="text-xs font-medium" style={{ color: progressColor }}>
          {`${completed}%`}
        </span>
      )}

      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[1400ms] ease-in-out"
          style={{
            width: `${completed}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      {suffixValueShown && (
        <span className="text-xs font-semibold text-black min-w-[28px] text-right">
          {`${completed}%`}
        </span>
      )}
    </div>
  );
};

export default PercentageBar;
