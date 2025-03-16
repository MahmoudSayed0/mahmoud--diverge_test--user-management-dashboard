import { ref } from 'vue';
import { defineStore } from 'pinia';

type Theme = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>(
    localStorage.getItem('theme') as Theme || 'system'
  );
  
  // Computed
  const isDark = ref(false);
  
  // Actions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme();
  }
  
  function applyTheme() {
    const root = window.document.documentElement;
    
    // Remove old classes
    root.classList.remove('light', 'dark');
    
    // Apply new theme
    if (theme.value === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      isDark.value = systemTheme === 'dark';
    } else {
      root.classList.add(theme.value);
      isDark.value = theme.value === 'dark';
    }
  }
  
  // Initialize theme
  function init() {
    applyTheme();
    
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme();
      }
    });
  }
  
  return {
    theme,
    isDark,
    setTheme,
    init
  };
}); 