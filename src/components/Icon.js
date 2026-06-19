// src/components/Icon.js
import React, { memo } from 'react';
import { ICONS } from './icons/registry';

const Icon = memo(({ name, size = 20, className = '', title, style }) => {
  const def = ICONS[name];
  if (!def) {
    if (process.env.NODE_ENV !== 'production') console.warn(`<Icon> unknown name: ${name}`);
    return null;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {def.body}
    </svg>
  );
});

export default Icon;
