// src/components/icons/registry.js
import React from 'react';

// Each entry: { body: <JSX children of a 0 0 24 24 svg>, currentColor?: boolean }
export const ICONS = {
  // ---- Golf ----
  'flag': { body: (<>
    <rect x="5" y="3" width="2.2" height="18" rx="1.1" fill="#64748b"/>
    <path d="M7.2 4h9.1a.6.6 0 0 1 .43 1.02L14 7.5l2.73 2.48A.6.6 0 0 1 16.3 11H7.2z" fill="#16a34a"/>
    <ellipse cx="6.1" cy="21" rx="4.6" ry="1.3" fill="#86efac"/>
  </>) },
  'target': { body: (<>
    <circle cx="12" cy="12" r="9" fill="#ef4444"/><circle cx="12" cy="12" r="6" fill="#fff"/>
    <circle cx="12" cy="12" r="3.4" fill="#ef4444"/><circle cx="12" cy="12" r="1.3" fill="#fff"/>
  </>) },
  'water': { body: (<>
    <path d="M12 3.2c3 4 5.5 6.6 5.5 9.8a5.5 5.5 0 0 1-11 0c0-3.2 2.5-5.8 5.5-9.8z" fill="#3b82f6"/>
    <path d="M9.5 13.6a2.6 2.6 0 0 0 2.6 2.6" fill="none" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round"/>
  </>) },
  'golfer': { body: (<>
    <circle cx="12" cy="6" r="3" fill="#15803d"/>
    <path d="M10.5 9.2 8 13l-3.5-1.5" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 9.5c2 .5 3 2 3.3 4l1.2 7" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 13.5 19 11" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M9.6 20.5 12 15" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round"/>
  </>) },

  // ---- Status ----
  'check-circle': { body: (<>
    <circle cx="12" cy="12" r="9.5" fill="#16a34a"/>
    <path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  'check': { currentColor: true, body: (
    <path d="M5 12.5l4 4 10-10.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
  ) },
  'x-circle': { body: (<>
    <circle cx="12" cy="12" r="9.5" fill="#ef4444"/>
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
  </>) },
  'x': { currentColor: true, body: (
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
  ) },
  'loading': { body: (<>
    <path d="M6 3h12a1 1 0 0 1 0 2h-.4c-.4 3-2.4 4.7-3.7 5.9 1.3 1.2 3.3 2.9 3.7 6h.4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2h.4c.4-3.1 2.4-4.8 3.7-6C8.8 9.7 6.8 8 6.4 5H6a1 1 0 0 1 0-2z" fill="#f59e0b"/>
    <path d="M9 6.3h6c-.3 1.6-1.6 2.7-3 3.7-1.4-1-2.7-2.1-3-3.7z" fill="#fde68a"/>
  </>) },
  'alert': { body: (<>
    <path d="M12 3.2 22 20.5a1.4 1.4 0 0 1-1.2 2.1H3.2A1.4 1.4 0 0 1 2 20.5z" fill="#f59e0b"/>
    <path d="M12 9.2v5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17.6" r="1.2" fill="#fff"/>
  </>) },
  'ban': { body: (<>
    <circle cx="12" cy="12" r="9" fill="none" stroke="#ef4444" strokeWidth="2.4"/>
    <path d="M5.6 5.6l12.8 12.8" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round"/>
  </>) },

  // ---- Navigation / actions ----
  'arrow-right': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></g>
  ) },
  'arrow-left': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H5"/><path d="M11 6l-6 6 6 6"/></g>
  ) },
  'arrow-up': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V5"/><path d="M6 11l6-6 6 6"/></g>
  ) },
  'edit': { body: (<>
    <path d="M15.4 4.6 19.4 8.6 9 19l-4.6 1 1-4.6z" fill="#fbbf24"/>
    <path d="M15.4 4.6 17 3a1.4 1.4 0 0 1 2 2l-1.6 1.6z" fill="#ef4444"/>
    <path d="M4.4 20 9 19 5.4 15.4z" fill="#334155"/>
  </>) },
  'share': { body: (<>
    <path d="M4 13h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#86efac"/>
    <path d="M12 15V3.6" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 7l4-4 4 4" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  'search': { body: (<>
    <circle cx="11" cy="11" r="6.5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
    <path d="M16 16l4.5 4.5" stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round"/>
  </>) },
  'link': { body: (<>
    <path d="M8.5 9.5 6 7a3 3 0 1 1 4.2-4.2l2.5 2.5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15.5 14.5 18 17a3 3 0 1 1-4.2 4.2l-2.5-2.5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 15l6-6" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
  </>) },
  'camera': { body: (<>
    <rect x="3" y="7.5" width="18" height="12" rx="2.4" fill="#16a34a"/>
    <path d="M8.5 7.5 9.7 5.4h4.6l1.2 2.1z" fill="#15803d"/>
    <circle cx="12" cy="13.5" r="3.6" fill="#dcfce7"/><circle cx="12" cy="13.5" r="2" fill="#15803d"/>
  </>) },

  // ---- Multiplayer ----
  'sync': { body: (
    <g fill="none" strokeLinecap="round"><circle cx="12" cy="12" r="2" fill="#16a34a" stroke="none"/>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" stroke="#16a34a" strokeWidth="2.2"/>
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" stroke="#16a34a" strokeWidth="2.2"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#86efac" strokeWidth="2.2"/>
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" stroke="#86efac" strokeWidth="2.2"/></g>
  ) },
  'users': { body: (<>
    <circle cx="9" cy="7" r="4" fill="#16a34a"/>
    <path d="M9 13c-4.4 0-7 2.5-7 5.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5c0-3-2.6-5.5-7-5.5z" fill="#16a34a"/>
    <circle cx="17.5" cy="7.5" r="3.2" fill="#5eead4"/>
    <path d="M17.5 12.7c-1 0-1.9.16-2.6.45 1.3 1.1 2.1 2.6 2.1 4.35V21h4a1 1 0 0 0 1-1v-1.3c0-3-2.3-6-4.5-6z" fill="#5eead4"/>
  </>) },
  'user': { body: (<>
    <circle cx="12" cy="7.5" r="4.2" fill="#16a34a"/>
    <path d="M12 13.5c-4.6 0-7.5 2.6-7.5 5.7V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-.8c0-3.1-2.9-5.7-7.5-5.7z" fill="#16a34a"/>
  </>) },
  'device': { body: (<>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" fill="#16a34a"/>
    <rect x="8" y="5" width="8" height="12" rx="1" fill="#dcfce7"/>
    <circle cx="12" cy="19.2" r="1" fill="#86efac"/>
  </>) },
  'globe': { body: (<>
    <circle cx="12" cy="12" r="9" fill="#3b82f6"/>
    <path d="M3 12h18M12 3c2.7 3 2.7 15 0 18M12 3c-2.7 3-2.7 15 0 18M5 6.2c4.2 2 9.8 2 14 0M5 17.8c4.2-2 9.8-2 14 0" fill="none" stroke="#bfdbfe" strokeWidth="1.2"/>
  </>) },
  'eye': { body: (<>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="3" fill="#3b82f6"/><circle cx="12" cy="12" r="1.1" fill="#fff"/>
  </>) },
  'dot': { currentColor: true, body: (<circle cx="12" cy="12" r="5" fill="currentColor"/>) },

  // ---- Reports ----
  'chart': { body: (<>
    <rect x="3.5" y="3" width="2" height="18" rx="1" fill="#cbd5e1"/>
    <rect x="3.5" y="19" width="17" height="2" rx="1" fill="#cbd5e1"/>
    <rect x="7.5" y="11" width="3" height="8" rx="1" fill="#4ade80"/>
    <rect x="12.5" y="7" width="3" height="12" rx="1" fill="#16a34a"/>
    <rect x="17.5" y="13" width="3" height="6" rx="1" fill="#22c55e"/>
  </>) },
  'clipboard': { body: (<>
    <rect x="5" y="4" width="14" height="18" rx="2.2" fill="#16a34a"/>
    <rect x="7" y="6.5" width="10" height="13.5" rx="1.4" fill="#fff"/>
    <rect x="9" y="2.6" width="6" height="3.4" rx="1.2" fill="#15803d"/>
    <path d="M9.3 11h5.4M9.3 14h5.4M9.3 17h3.4" stroke="#86efac" strokeWidth="1.4" strokeLinecap="round"/>
  </>) },
  'comment': { body: (<>
    <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16.5H4a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 4 5.5z" fill="#16a34a"/>
    <path d="M7.5 9.5h9M7.5 12.5h6" stroke="#bbf7d0" strokeWidth="1.5" strokeLinecap="round"/>
  </>) },
  'tip': { body: (<>
    <path d="M12 3a6 6 0 0 0-3.8 10.7c.7.6 1.1 1.2 1.3 2.3h5c.2-1.1.6-1.7 1.3-2.3A6 6 0 0 0 12 3z" fill="#fbbf24"/>
    <rect x="9.3" y="16.5" width="5.4" height="2.2" rx="1.1" fill="#94a3b8"/>
    <rect x="10" y="19" width="4" height="2.2" rx="1.1" fill="#64748b"/>
    <path d="M9.8 13c-.6-1.2-.5-2.5.4-3.5" stroke="#fff7cc" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  </>) },

  // ---- Rewards ----
  'celebrate': { body: (<>
    <path d="M3.5 20.8 9 10.8l4.4 4.4L3.5 20.8z" fill="#16a34a"/>
    <path d="M9 10.8l4.4 4.4-2.2 1-3.2-3.2z" fill="#15803d"/>
    <path d="M14 8.8c1.1-1.3 2.8-1.5 4-.6" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="15.5" cy="4.6" r="1" fill="#ef4444"/><circle cx="19.2" cy="7.4" r="1" fill="#3b82f6"/>
    <circle cx="20.4" cy="3.4" r=".9" fill="#f59e0b"/><circle cx="12.3" cy="5.2" r=".9" fill="#a855f7"/>
  </>) },
  'trophy': { body: (<>
    <path d="M6 3h12v6a6 6 0 0 1-12 0V3z" fill="#f59e0b"/>
    <path d="M7 4H4.3a2.3 2.3 0 0 0 0 4.6H7V4z" fill="#f59e0b"/>
    <path d="M17 4h2.7a2.3 2.3 0 0 1 0 4.6H17V4z" fill="#f59e0b"/>
    <rect x="10.5" y="13.5" width="3" height="4.5" fill="#d97706"/>
    <rect x="7" y="20" width="10" height="2.4" rx="1.2" fill="#b45309"/>
    <path d="M12 5.2l.8 1.7 1.9.2-1.4 1.3.4 1.8L12 9.4l-1.7.9.4-1.8-1.4-1.3 1.9-.2z" fill="#fff7cc"/>
  </>) },
  'medal-gold': { body: (<>
    <path d="M9 3l2.2 5M15 3l-2.2 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="6" fill="#f59e0b"/><circle cx="12" cy="15" r="3.9" fill="#fcd34d"/>
    <path d="M12 12.8l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#b45309"/>
  </>) },
  'medal-silver': { body: (<>
    <path d="M9 3l2.2 5M15 3l-2.2 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="6" fill="#94a3b8"/><circle cx="12" cy="15" r="3.9" fill="#e2e8f0"/>
    <path d="M12 12.8l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#64748b"/>
  </>) },
  'medal-bronze': { body: (<>
    <path d="M9 3l2.2 5M15 3l-2.2 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="6" fill="#c2722e"/><circle cx="12" cy="15" r="3.9" fill="#e3a06a"/>
    <path d="M12 12.8l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#8a4b1e"/>
  </>) },
  'money-bag': { body: (<>
    <path d="M8 7h8c2.5 2 4 4.7 4 7.5A6.5 6.5 0 0 1 13.5 21h-3A6.5 6.5 0 0 1 4 14.5C4 11.7 5.5 9 8 7z" fill="#16a34a"/>
    <path d="M8.2 7c0-1.4 1-2.4 1.5-3.4h4.6c.5 1 1.5 2 1.5 3.4z" fill="#15803d"/>
    <path d="M12 10.4v6.2M10.3 11.6c0-.8.8-1.2 1.7-1.2s1.7.4 1.7 1.2-.8 1.1-1.7 1.3-1.7.5-1.7 1.3.8 1.2 1.7 1.2 1.7-.4 1.7-1.2" fill="none" stroke="#fde68a" strokeWidth="1.3" strokeLinecap="round"/>
  </>) },
  'cash': { body: (<>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" fill="#16a34a"/>
    <circle cx="12" cy="12" r="3" fill="#86efac"/>
    <path d="M12 10.4v3.2M11 11.2c0-.5.5-.8 1-.8s1 .3 1 .7-.5.6-1 .8-1 .3-1 .8.5.7 1 .7 1-.3 1-.7" stroke="#15803d" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <circle cx="5.5" cy="12" r="1.1" fill="#bbf7d0"/><circle cx="18.5" cy="12" r="1.1" fill="#bbf7d0"/>
  </>) },

  // ---- Misc / system ----
  'game': { body: (<>
    <path d="M7 8h10a4.5 4.5 0 0 1 4.4 5.5l-.8 3.6A2.4 2.4 0 0 1 16 17.2l-1.3-2H9.3l-1.3 2a2.4 2.4 0 0 1-4.6-.1l-.8-3.6A4.5 4.5 0 0 1 7 8z" fill="#16a34a"/>
    <path d="M6.8 11v3M5.3 12.5h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="15.4" cy="11.8" r="1.05" fill="#fff"/><circle cx="17.3" cy="13.6" r="1.05" fill="#fff"/>
  </>) },
  'home': { body: (<>
    <path d="M6 10.5 12 5.5l6 5V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" fill="#86efac"/>
    <path d="M3 11.5 12 4l9 7.5" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="10" y="14" width="4" height="6" rx="0.5" fill="#15803d"/>
  </>) },
  'sound-on': { body: (<>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" fill="currentColor"/>
    <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </>) },
  'sound-off': { body: (<>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" fill="currentColor"/>
    <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </>) },
  'bolt': { body: (
    <path d="M13 2 4 13.5h6L11 22l9-11.5h-6z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" strokeLinejoin="round"/>
  ) },
  'bug': { body: (<>
    <ellipse cx="12" cy="13.5" rx="5" ry="6" fill="#16a34a"/>
    <path d="M9.2 5.2 10.5 7M14.8 5.2 13.5 7" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="9.8" cy="4.6" r=".9" fill="#15803d"/><circle cx="14.2" cy="4.6" r=".9" fill="#15803d"/>
    <path d="M7 10.5H4M7 13.5H3.5M7 16.5H4.2M17 10.5h3M17 13.5h3.5M17 16.5h-3" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="10.4" cy="11.5" r=".8" fill="#fff"/><circle cx="13.6" cy="11.5" r=".8" fill="#fff"/>
  </>) },
  'suit-spade': { body: (<>
    <path d="M12 21c-5-4-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7-8 11z" fill="#334155"/>
    <rect x="11" y="14" width="2" height="7" fill="#334155"/>
  </>) },
  'mail': { body: (<>
    <rect x="3" y="6" width="18" height="12" rx="2.4" fill="#16a34a"/>
    <path d="M4.5 8l7.5 5.2L19.5 8" fill="none" stroke="#dcfce7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  'star': { body: (
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 .98 5.7L12 17.2 6.92 22l.98-5.7-4.1-4 5.7-.8z" fill="#f59e0b"/>
  ) },
  'star-outline': { body: (
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 .98 5.7L12 17.2 6.92 22l.98-5.7-4.1-4 5.7-.8z" fill="none" stroke="#cbd5e1" strokeWidth="1.6" strokeLinejoin="round"/>
  ) },

  // ---- Part 3: money / status ----
  'coin': { body: (<>
    <circle cx="12" cy="12" r="9" fill="#f59e0b"/>
    <circle cx="12" cy="12" r="6.6" fill="#fcd34d"/>
    <path d="M12 7.2v9.6M9.9 9.3c0-1 .95-1.6 2.1-1.6s2.1.6 2.1 1.6-.95 1.4-2.1 1.7-2.1.7-2.1 1.7.95 1.6 2.1 1.6 2.1-.6 2.1-1.6" fill="none" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round"/>
  </>) },
  'alert-circle': { body: (<>
    <circle cx="12" cy="12" r="9.5" fill="#f59e0b"/>
    <path d="M12 7v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="12" cy="16.4" r="1.3" fill="#fff"/>
  </>) },
  'map-pin': { body: (<>
    <path d="M12 2.5c-3.9 0-7 3-7 6.8 0 4.6 5.3 10 6.4 11.1a.85.85 0 0 0 1.2 0C13.7 19.3 19 13.9 19 9.3c0-3.8-3.1-6.8-7-6.8z" fill="#ef4444"/>
    <circle cx="12" cy="9.2" r="2.6" fill="#fff"/>
  </>) },
  'settings': { body: (<>
    <path d="M10.6 2.6h2.8l.5 2.5 2.4 1 2.2-1.3 2 2-1.3 2.2 1 2.4 2.5.5v2.8l-2.5.5-1 2.4 1.3 2.2-2 2-2.2-1.3-2.4 1-.5 2.5h-2.8l-.5-2.5-2.4-1-2.2 1.3-2-2 1.3-2.2-1-2.4-2.5-.5v-2.8l2.5-.5 1-2.4-1.3-2.2 2-2 2.2 1.3 2.4-1z" fill="#64748b"/>
    <circle cx="12" cy="12" r="3.2" fill="#e2e8f0"/>
  </>) },
  'clock': { body: (<>
    <circle cx="12" cy="12" r="9" fill="#3b82f6"/>
    <circle cx="12" cy="12" r="6.6" fill="#dbeafe"/>
    <path d="M12 8.2v4l2.8 1.7" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  // ---- Part 3: tool icons (currentColor) ----
  'trending-up': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M16 7h5v5"/></g>
  ) },
  'play': { currentColor: true, body: (
    <path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor"/>
  ) },
  'copy': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></g>
  ) },
  'chevron-down': { currentColor: true, body: (
    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  ) },
  'chevron-up': { currentColor: true, body: (
    <path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  ) },
  'plus': { currentColor: true, body: (
    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
  ) },
  'minus': { currentColor: true, body: (
    <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
  ) },
};
