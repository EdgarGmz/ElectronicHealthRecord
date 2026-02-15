/**
 * Tailwind CSS Configuration
 * Sistema EHR (Electronic Health Record)
 * 
 * Este archivo configura TailwindCSS con los design tokens
 * del sistema de diseño EHR, incluyendo soporte para dark mode.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Dark mode usando clase personalizada [data-theme="dark"]
  darkMode: 'class',
  
  theme: {
    extend: {
      // =====================================
      // COLORS
      // =====================================
      colors: {
        // Primary - Healthcare Blue
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        
        // Success - Medical Green
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        
        // Warning
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
        
        // Error
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
        },
        
        // Info
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        
        // Functional - Departments
        psychology: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        nursing: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          500: '#10B981',
          600: '#059669',
        },
        admin: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },

      // =====================================
      // TYPOGRAPHY
      // =====================================
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        roboto: ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'Consolas', 'Monaco', 'monospace'],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4' }],         // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],        // 14px
        base: ['1rem', { lineHeight: '1.5' }],          // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],        // 18px
        xl: ['1.25rem', { lineHeight: '1.4' }],         // 20px
        '2xl': ['1.5rem', { lineHeight: '1.35' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3' }],     // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],         // 48px
        '6xl': ['3.75rem', { lineHeight: '1.2' }],      // 60px
      },
      
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      lineHeight: {
        none: '1',
        tight: '1.2',
        snug: '1.35',
        normal: '1.5',
        relaxed: '1.6',
        loose: '1.8',
      },
      
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.05em',
        widest: '0.1em',
      },

      // =====================================
      // SPACING (8px system)
      // =====================================
      spacing: {
        px: '1px',
        0: '0',
        0.5: '0.125rem',    // 2px
        1: '0.25rem',       // 4px
        1.5: '0.375rem',    // 6px
        2: '0.5rem',        // 8px
        2.5: '0.625rem',    // 10px
        3: '0.75rem',       // 12px
        4: '1rem',          // 16px
        5: '1.25rem',       // 20px
        6: '1.5rem',        // 24px
        7: '1.75rem',       // 28px
        8: '2rem',          // 32px
        9: '2.25rem',       // 36px
        10: '2.5rem',       // 40px
        11: '2.75rem',      // 44px
        12: '3rem',         // 48px
        14: '3.5rem',       // 56px
        16: '4rem',         // 64px
        20: '5rem',         // 80px
        24: '6rem',         // 96px
        28: '7rem',         // 112px
        32: '8rem',         // 128px
        36: '9rem',         // 144px
        40: '10rem',        // 160px
        44: '11rem',        // 176px
        48: '12rem',        // 192px
        52: '13rem',        // 208px
        56: '14rem',        // 224px
        60: '15rem',        // 240px
        64: '16rem',        // 256px
      },

      // =====================================
      // BORDERS
      // =====================================
      borderRadius: {
        none: '0',
        sm: '0.125rem',     // 2px
        DEFAULT: '0.375rem', // 6px
        md: '0.375rem',     // 6px
        lg: '0.5rem',       // 8px
        xl: '0.75rem',      // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
        full: '9999px',
      },
      
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        2: '2px',
        4: '4px',
        8: '8px',
      },

      // =====================================
      // SHADOWS
      // =====================================
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },

      // =====================================
      // TRANSITIONS
      // =====================================
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },
      
      transitionTimingFunction: {
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // =====================================
      // ANIMATIONS
      // =====================================
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },

      // =====================================
      // BREAKPOINTS
      // =====================================
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // =====================================
      // CONTAINER
      // =====================================
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2rem',
          '2xl': '2rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },

      // =====================================
      // Z-INDEX
      // =====================================
      zIndex: {
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        'modal-backdrop': '1300',
        modal: '1400',
        popover: '1500',
        tooltip: '1600',
        toast: '1700',
      },

      // =====================================
      // GLASSMORPHISM - iOS Style
      // =====================================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },

  // =====================================
  // PLUGINS
  // =====================================
  plugins: [
    // Forms plugin for better form styling
    require('@tailwindcss/forms'),
    
    // Typography plugin for prose content
    require('@tailwindcss/typography'),
    
    // Aspect ratio plugin (if needed)
    // require('@tailwindcss/aspect-ratio'),
    
    // Line clamp plugin (if needed)
    // require('@tailwindcss/line-clamp'),
    
    // Custom plugin para dark mode con [data-theme="dark"]
    function({ addVariant }) {
      addVariant('dark', '[data-theme="dark"] &');
    }
  ],

  // =====================================
  // DARK MODE (if needed in future)
  // =====================================
  // darkMode ya está configurado como 'class' arriba
}
