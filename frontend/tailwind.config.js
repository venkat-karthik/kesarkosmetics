module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
      },
      colors: {
        // Saffron theme palette
        "kesar-gold":    "#F5A800",   // warm amber gold
        "kesar-orange":  "#E8620A",   // deep saffron orange
        "kesar-red":     "#C8380A",   // rich red-orange
        "kesar-dark":    "#4A1A00",   // deep dark brown
        "kesar-brown":   "#7A3B00",   // mid brown
        "kesar-cream":   "#FFF8EC",   // warm cream
        "kesar-light":   "#FFF3D6",   // light amber
        "kesar-muted":   "#8B5E1A",   // muted amber text
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0%)" }, "100%": { transform: "translateX(-50%)" } },
        fadeInUp: { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "marquee-slow": "marquee 50s linear infinite",
        "fade-in-up": "fadeInUp 0.4s ease-out",
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /^grid-cols-/ },
    { pattern: /^(sm|md|lg|xl|xs):/ },
    { pattern: /^gap-/ },
    { pattern: /^p-/ },
    { pattern: /^w-/ },
    { pattern: /^h-/ },
    { pattern: /^text-/ },
  ],
};
