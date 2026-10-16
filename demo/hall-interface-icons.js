// One small, code-native icon family for the lake-and-jade hall.
const paths={
 more:'<path d="M7 15h18M7 23h18"/><circle cx="16" cy="8" r="2"/>',
 rules:'<path d="M6 5h9c3 0 4 2 4 4v18c-1-2-3-3-6-3H6zM19 9c0-2 2-4 4-4h4v19h-3c-2 0-4 1-5 3M10 11h4M10 15h4"/>',
 feedback:'<path d="M26 20c-3 4-8 5-13 3l-6 4 1-7C2 13 6 5 15 5s15 8 11 15Z"/><path d="M10 14h.1M16 14h.1M22 14h.1" stroke-width="3"/>',
 activity:'<path d="M6 10h20v6H6zM8 16v11h16V16M16 10v17M16 10C6 9 8 1 13 5l3 5Zm0 0c10-1 8-9 3-5l-3 5Z"/>',
 mail:'<rect x="4" y="7" width="24" height="19" rx="3"/><path d="m5 9 11 9L27 9M5 24l7-7M27 24l-7-7"/>',
 settings:'<path d="m13 3 6 0 1 4 4 2 4-1 3 5-3 3v4l3 3-3 5-4-1-4 2-1 4h-6l-1-4-4-2-4 1-3-5 3-3v-4l-3-3 3-5 4 1 4-2Z" transform="translate(1 -1) scale(.9)"/><circle cx="16" cy="16" r="5"/>',
 close:'<path d="m9 9 14 14M23 9 9 23"/>',
 down:'<path d="m8 12 8 8 8-8"/>',
 next:'<path d="m12 8 8 8-8 8"/>',
 music:'<path d="M13 24V8l13-3v16M13 12l13-3"/><ellipse cx="9" cy="25" rx="4" ry="3"/><ellipse cx="22" cy="22" rx="4" ry="3"/>',
 sound:'<path d="M5 12h5l7-6v20l-7-6H5zM22 11c3 3 3 7 0 10M26 7c5 5 5 13 0 18"/>',
 effects:'<path d="m16 3 3 10 10 3-10 3-3 10-3-10-10-3 10-3ZM25 2v5M22.5 4.5h5"/>',
 coin:'<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="8"/><path d="M12 12h8l-8 8h8"/>',
 play:'<rect x="3" y="6" width="26" height="20" rx="4"/><path d="m13 11 8 5-8 5z"/>',
 check:'<path d="m7 16 6 6L26 9"/>',
 leaf:'<path d="M6 27c4-15 12-18 21-21 1 9-3 19-13 19M9 22 24 9M14 17v-6M18 13h6"/>'
};
export function hallIcon(name,className=''){return `<svg class="hall-ui-icon ${className}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.leaf}</svg>`;}
