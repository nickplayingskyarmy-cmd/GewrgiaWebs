/** ====================================================================
 *  ΡΥΘΜΙΣΕΙΣ TAILWIND — χρωματική παλέτα & τυπογραφία του portfolio
 *  --------------------------------------------------------------------
 *  Μετά από αλλαγές εδώ (ή αν προσθέσεις ΝΕΕΣ κλάσεις Tailwind στο
 *  index.html / js/main.js), ξανά-χτίσε το CSS με:
 *
 *      npm run build:css
 *
 *  Απλές αλλαγές κειμένων ή εικόνων ΔΕΝ χρειάζονται rebuild.
 *  ==================================================================== */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink:      '#0F0F0F',   /* Μαύρο φόντο         */
        surface:  '#161616',   /* Ελαφρώς πιο ανοιχτό  */
        brand: {
          DEFAULT: '#FF4FA3',  /* Ροζ                  */
          soft:    '#FF7BBF',  /* Απαλό ροζ            */
          dark:    '#D93A8A'   /* Σκούρο ροζ           */
        },
        offwhite: '#F5F5F5'    /* Ανοιχτό γκρι         */
      },
      fontFamily: {
        /* Montserrat για λατινικά + Manrope για ελληνικά (δες css/fonts.css) */
        sans: ['Montserrat', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow':    '0 0 45px rgba(255, 79, 163, 0.35)',
        'glow-sm': '0 0 22px rgba(255, 79, 163, 0.25)',
        'card':    '0 24px 60px -18px rgba(0, 0, 0, 0.6)'
      }
    }
  },
  plugins: []
};
