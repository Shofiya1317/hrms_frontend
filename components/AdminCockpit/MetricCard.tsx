import Icon from '@/components/ui/AppIcon';

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  trend1?: {
    value: number;
    direction: 'up' | 'down';
  };
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'orange' | 'red';
  suffix?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    trend: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    trend: 'text-green-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    trend: 'text-emerald-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    trend: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    trend: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    trend: 'text-red-600',
  },
};

const MetricCard = ({
  title, value, icon, trend, trend1, color, suffix,
}: MetricCardProps) => {
  const colors = colorClasses[color];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon name={icon} size={24} className={colors.icon} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
          >
            <Icon
              name={trend.direction === 'up' ? 'ArrowUpIcon' : 'ArrowDownIcon'}
              size={16}
            />
            {trend.value}
            %
          </div>
        )}
        {trend1 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend1.direction === 'up' ? 'text-red-600' : 'text-green-600'
          }`}
          >
            <Icon
              name={trend1.direction === 'up' ? 'ArrowUpIcon' : 'ArrowDownIcon'}
              size={16}
            />
            {trend1.value}
            %
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        <p className="text-text-primary text-3xl font-bold">
          {value}
          {suffix && <span className="text-xl text-text-secondary ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
