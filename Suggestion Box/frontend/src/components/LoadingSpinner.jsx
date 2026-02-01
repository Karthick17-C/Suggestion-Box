import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-cyber-500/20 animate-ping" />
        {/* Main spinner */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-2 border-cyber-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyber-400 animate-spin" />
          <div className="absolute inset-1 rounded-full border border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
      </div>
      {text && (
        <p className="mt-5 text-gray-400 text-sm font-medium tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
