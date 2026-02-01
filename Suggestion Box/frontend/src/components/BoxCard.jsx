import { Link } from 'react-router-dom';
import { Lock, MessageSquare, Users, Image, Zap } from 'lucide-react';

const BoxCard = ({ box }) => {
  const isPrivate = !box.isPublic;

  return (
    <Link to={`/box/${box.boxId}`} className="glass-card group block hover:border-cyber-500/30 transition-all duration-500">
      <div 
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${box.theme?.primaryColor || '#00d4ff'}10` }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div 
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40" 
            style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }} 
          />
          <div 
            className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40" 
            style={{ backgroundColor: box.theme?.primaryColor || '#00d4ff' }} 
          />
          {/* Cyber grid overlay */}
          <div className="absolute inset-0 cyber-grid opacity-30" />
        </div>
        
        {/* Logo Image */}
        <div className="relative z-10">
          {box.logoUrl ? (
            <img 
              src={box.logoUrl} 
              alt={box.title} 
              className="w-18 h-18 object-cover rounded-2xl shadow-lg"
              style={{ '--tw-shadow-color': box.theme?.primaryColor || '#00d4ff' }}
            />
          ) : (
            <div 
              className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: `${box.theme?.primaryColor || '#00d4ff'}30`,
                borderWidth: 1,
                borderColor: `${box.theme?.primaryColor || '#00d4ff'}50`,
                boxShadow: `0 10px 30px -5px ${box.theme?.primaryColor || '#00d4ff'}30`
              }}
            >
              <Image className="w-9 h-9" style={{ color: box.theme?.primaryColor || '#00d4ff' }} />
            </div>
          )}
        </div>

        {/* Private badge */}
        {isPrivate && (
          <div className="absolute top-3 right-3 glass-card px-2.5 py-1 flex items-center gap-1.5 text-xs font-medium text-amber-400 border border-amber-500/30">
            <Lock className="w-3 h-3" />
            Private
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-lg mb-1.5 truncate group-hover:text-cyber-400 transition-colors">
          {box.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {box.description || 'Share your thoughts and ideas'}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-cyber-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{box.suggestionsCount || 0} suggestions received</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BoxCard;
