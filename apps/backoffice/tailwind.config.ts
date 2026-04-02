import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/ui/**/*.tsx',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border-200)",
        input: "var(--border-200)",
        ring: "var(--pisky-blue-400)",
        background: "var(--gray-50)",
        foreground: "var(--gray-900)",
        primary: {
          DEFAULT: "var(--pisky-blue-600)",
          foreground: "#FFFFFF",
          50: "var(--pisky-blue-50)",
          100: "var(--pisky-blue-100)",
          200: "var(--pisky-blue-200)",
          300: "var(--pisky-blue-300)",
          400: "var(--pisky-blue-400)",
          500: "var(--pisky-blue-500)",
          600: "var(--pisky-blue-600)",
          700: "var(--pisky-blue-700)",
          800: "var(--pisky-blue-800)",
          900: "var(--pisky-blue-900)",
        },
        secondary: {
          DEFAULT: "var(--coral-500)",
          foreground: "#FFFFFF",
          50: "var(--coral-50)",
          100: "var(--coral-100)",
          200: "var(--coral-200)",
          300: "var(--coral-300)",
          400: "var(--coral-400)",
          500: "var(--coral-500)",
          600: "var(--coral-600)",
          700: "var(--coral-700)",
          800: "var(--coral-800)",
          900: "var(--coral-900)",
        },
        success: {
          DEFAULT: "var(--success-500)",
          foreground: "#FFFFFF",
          light: "var(--success-50)",
          dark: "var(--success-700)",
        },
        warning: {
          DEFAULT: "var(--warning-500)",
          foreground: "#FFFFFF",
          light: "var(--warning-50)",
          dark: "var(--warning-700)",
        },
        info: {
          DEFAULT: "var(--pisky-blue-600)",
          foreground: "#FFFFFF",
          light: "var(--pisky-blue-50)",
          dark: "var(--pisky-blue-700)",
        },
        error: {
          DEFAULT: "var(--error-500)",
          foreground: "#FFFFFF",
          light: "var(--error-50)",
          dark: "var(--error-700)",
        },
        muted: {
          DEFAULT: "var(--gray-100)",
          foreground: "var(--gray-600)",
        },
        accent: {
          DEFAULT: "var(--pisky-blue-100)",
          foreground: "var(--pisky-blue-700)",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "var(--gray-900)",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "var(--gray-900)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-bg)",
          foreground: "var(--sidebar-text-primary)",
          primary: "var(--sidebar-text-primary)",
          primaryForeground: "var(--sidebar-text-primary)",
          accent: "var(--sidebar-item-hover)",
          accentForeground: "var(--sidebar-text-primary)",
          border: "var(--sidebar-border)",
          ring: "var(--pisky-blue-400)",
        },
        chart: {
          1: "var(--pisky-blue-600)",
          2: "var(--coral-500)",
          3: "var(--success-500)",
          4: "var(--warning-500)",
          5: "var(--error-500)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-in",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-out": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(-10px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}

export default config
