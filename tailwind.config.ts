import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors - zinc/slate/cyan as requested
        'mc-bg': '#09090b',  // zinc-950
        'mc-bg-secondary': '#18181b',  // zinc-950 (lighter)
        'mc-bg-tertiary': '#52525b',  // zinc-600
        'mc-border': '#27272a',  // zinc-800
        'mc-text': '#e4e4e7',  // zinc-200
        'mc-text-secondary': '#a1a1aa',  // zinc-400
        'mc-accent': '#22d3ee',  // cyan-400
        'mc-accent-green': '#22c55e',  // green-500
        'mc-accent-yellow': '#eab308',  // yellow-500
        'mc-accent-red': '#ef4444',  // red-500
        'mc-accent-purple': '#a855f7',  // purple-500
        'mc-accent-pink': '#ec4899',  // pink-500
        'mc-accent-cyan': '#22d3ee',  // cyan-400
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
