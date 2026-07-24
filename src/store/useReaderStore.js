// src/store/useReaderStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useReaderStore = create(
  persist(
    (set) => ({
      // --- Post Data State ---
      post: null,
      liked: false,
      tableOfContents: [],
      
      setPost: (post) => set({ post }),
      setLiked: (liked) => set({ liked }),
      setTableOfContents: (toc) => set({ tableOfContents: toc }),

      // --- UI & UX State ---
      isSidebarOpen: false,
      isSettingsOpen: false,
      readMode: 'dark', // 'light', 'dark', 'sepia', 'chatgpt'
      fontFamily: 'font-sans', // 'font-sans', 'font-serif', 'font-mono'
      isFocusMode: false,

      // UI Actions
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setReadMode: (mode) => set({ readMode: mode }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setFocusMode: (isFocus) => set({ isFocusMode: isFocus }),
      
      // Toggle Helpers
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    }),
    {
      name: 'reader-preferences', // unique name for localStorage key
      // ONLY save readMode and fontFamily to localStorage
      partialize: (state) => ({ 
        readMode: state.readMode, 
        fontFamily: state.fontFamily 
      }), 
    }
  )
)