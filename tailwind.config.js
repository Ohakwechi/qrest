/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cannabis: {
          dark: '#0B1511',     // Deep obsidian forest green
          emerald: '#1C3A27',  // Rich premium pine accent
          mint: '#A3E635',     // Vibrant electric lime for high-visibility UI actions
          gold: '#D4AF37',     // Soft champagne gold for boutique oil/concentrate lines
          sativa: '#F59E0B',   // Warm amber orange
          indica: '#8B5CF6',   // Rich velvet purple
          hybrid: '#10B981',   // Deep emerald green
          bone: '#F9F6F0',     // Luxurious off-white background option
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'], // Elegant serif headers for high-end boutique brands
      }
    },
  },
  plugins: [],
}