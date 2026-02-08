import { useMemo } from 'react';

interface BadgeProps {
  iconSvg: string;
  gradientFrom?: string;
  gradientTo?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ 
  iconSvg, 
  gradientFrom = '217 91% 60%', 
  gradientTo = '263 90% 51%',
  size = 'md',
  className = '' 
}: BadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const gradientStyle = useMemo(() => ({
    background: `linear-gradient(135deg, hsl(${gradientFrom}) 0%, hsl(${gradientTo}) 100%)`,
  }), [gradientFrom, gradientTo]);

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
      style={gradientStyle}
    >
      <div 
        className="w-3/4 h-3/4"
        style={{ color: 'white' }}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    </div>
  );
}