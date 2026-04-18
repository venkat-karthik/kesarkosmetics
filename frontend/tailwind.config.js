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
