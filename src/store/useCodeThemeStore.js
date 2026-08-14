import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Import themes from react-syntax-highlighter
import {
  vscDarkPlus,
  dracula,
  oneDark,
  nightOwl,
  nord,
  okaidia,
  atomDark,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';

export const CODE_THEMES = {
  vscDarkPlus: { label: 'VS Code Dark', theme: vscDarkPlus, bg: '#1e1e1e' },
  oneDark: { label: 'One Dark', theme: oneDark, bg: '#282c34' },
  dracula: { label: 'Dracula', theme: dracula, bg: '#282a36' },
  nightOwl: { label: 'Night Owl', theme: nightOwl, bg: '#011627' },
  nord: { label: 'Nord', theme: nord, bg: '#2e3440' },
  okaidia: { label: 'Okaidia', theme: okaidia, bg: '#272822' },
  atomDark: { label: 'Atom Dark', theme: atomDark, bg: '#1d1f21' },
};

export const useCodeThemeStore = create(
  persist(
    (set) => ({
      currentThemeKey: 'vscDarkPlus',
      fontSize: 15, // Slightly larger base font size (default is typically 12-13px)
      showLineNumbers: true,

      setThemeKey: (key) => set({ currentThemeKey: key }),
      setFontSize: (size) => set({ fontSize: size }),
      toggleLineNumbers: () =>
        set((state) => ({ showLineNumbers: !state.showLineNumbers })),
    }),
    {
      name: 'markdown-code-theme-settings',
    }
  )
);