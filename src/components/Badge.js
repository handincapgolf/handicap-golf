// src/components/Badge.js
import React, { memo } from 'react';

const Badge = memo(({ label, shape = 'circle', color = '#16a34a', textColor = '#fff', size = 24, className = '', style = {} }) => (
  <span
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: shape === 'square' ? '28%' : '50%',
      background: color,
      color: textColor,
      fontWeight: 800,
      fontSize: Math.round(size * 0.5),
      lineHeight: 1,
      flexShrink: 0,
      ...style,
    }}
  >
    {label}
  </span>
));

export default Badge;
