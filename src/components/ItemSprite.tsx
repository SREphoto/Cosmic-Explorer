import React from 'react';

interface ItemSpriteProps {
  src?: string | null;
  fallback?: string;
  className?: string;
  alt?: string;
}

export const ItemSprite: React.FC<ItemSpriteProps> = ({
  src,
  fallback = '',
  className = 'w-10 h-10 object-contain',
  alt = '',
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={className}
        style={{ imageRendering: 'auto' }}
      />
    );
  }
  if (fallback) {
    return <span className={className}>{fallback}</span>;
  }
  return null;
};
