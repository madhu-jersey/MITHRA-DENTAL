// Inline SVG icon sprite (simple line icons, 24x24, stroke-based).
const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  phone: '<path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.5 8.5"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  map: '<path d="M9 4.5l-5.5 2v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2zM9 4.5v13M15 6.5v13"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
  star: '<path d="M12 3.3l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.5l6-.7z"/>',
  quote: '<path d="M10 7H6.5A1.5 1.5 0 0 0 5 8.5V12h4v5H5M19 7h-3.5A1.5 1.5 0 0 0 14 8.5V12h4v5h-4"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  // Service / topic icons
  tooth: '<path d="M7.5 3.8c1.7 0 2.6.9 4.5.9s2.8-.9 4.5-.9c2.6 0 4 2.2 4 4.9 0 2.4-1 4-1.6 6.3-.6 2.4-.9 5.7-2.6 5.7-1.9 0-1.6-5.2-4.3-5.2s-2.4 5.2-4.3 5.2c-1.7 0-2-3.3-2.6-5.7C4.5 12.7 3.5 11.1 3.5 8.7c0-2.7 1.4-4.9 4-4.9z"/>',
  implant: '<path d="M8 3.5h8c.8 0 1.5.7 1.5 1.5v1.5c0 1.4-1.1 2.5-2.5 2.5H9A2.5 2.5 0 0 1 6.5 6.5V5c0-.8.7-1.5 1.5-1.5zM9 11h6M9.5 14h5M10 17h4M10.5 20h3M12 9v12"/>',
  sparkle: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  shield: '<path d="M12 3.5l7.5 3v5.3c0 4.4-3.2 8-7.5 9.2-4.3-1.2-7.5-4.8-7.5-9.2V6.5z"/><path d="M12 9v6M9 12h6"/>',
  profile: '<path d="M14 3.5c-4 0-7 3-7 6.8 0 1-.9 1.9-1.6 2.9-.4.5-.1 1.2.5 1.3l1.1.2v2.2c0 1.2 1 2.1 2.2 2.1H11v1.5M14 3.5c3.6 0 6.5 2.9 6.5 6.5 0 2.4-1.2 4.3-3 5.5v5"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  drop: '<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z"/>',
  alert: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 16.8v.1"/>',
  crack: '<path d="M7.5 3.8c1.7 0 2.6.9 4.5.9s2.8-.9 4.5-.9c2.6 0 4 2.2 4 4.9 0 2.4-1 4-1.6 6.3-.6 2.4-.9 5.7-2.6 5.7-1.9 0-1.6-5.2-4.3-5.2s-2.4 5.2-4.3 5.2c-1.7 0-2-3.3-2.6-5.7C4.5 12.7 3.5 11.1 3.5 8.7c0-2.7 1.4-4.9 4-4.9z"/><path d="M12 4.7l-1.5 3 2.5 1.5-1.5 3"/>',
  gap: '<rect x="3.5" y="6" width="6" height="12" rx="2.5"/><rect x="14.5" y="6" width="6" height="12" rx="2.5"/><path d="M11 12h2"/>',
  layers: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8 13.5c1 1.6 2.4 2.5 4 2.5s3-.9 4-2.5M9 9.5v.1M15 9.5v.1"/>',
  face: '<path d="M12 3.5c4 0 7 3.2 7 7.5 0 5-3.3 9.5-7 9.5S5 16 5 11c0-4.3 3-7.5 7-7.5z"/><path d="M9.5 10.5v.1M14.5 10.5v.1M10 15.5c1.2.8 2.8.8 4 0"/>',
  circle: '<circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="8.5" stroke-dasharray="2 3"/>',
  steth: '<path d="M6 3.5v5a4 4 0 0 0 8 0v-5M10 12.5v2a5 5 0 0 0 10 0V12"/><circle cx="20" cy="10" r="2"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
};

export function sprite() {
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${Object.entries(paths)
    .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`)
    .join("")}</svg>`;
}

export function icon(name, cls = "") {
  const fill = name === "star" ? " icon--fill" : "";
  const arrow = name === "arrow" ? " icon--arrow" : "";
  return `<svg class="icon${fill}${arrow}${cls ? " " + cls : ""}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
}
