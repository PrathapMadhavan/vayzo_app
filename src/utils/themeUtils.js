export const applyThemeToDocument = (color, mode) => {
  const root = document.documentElement;
  
  if (color) {
    root.style.setProperty('--vayzo-primary', color);
    
    // Generate hover by darkening slightly or adjusting opacity
    // For a robust hex handling:
    let r = 0, g = 0, b = 0;
    if (color.length === 7) {
      r = parseInt(color.substring(1, 3), 16);
      g = parseInt(color.substring(3, 5), 16);
      b = parseInt(color.substring(5, 7), 16);
    }
    root.style.setProperty('--vayzo-primary-hover', `rgba(${r}, ${g}, ${b}, 0.9)`);
    root.style.setProperty('--vayzo-primary-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
  }
  
  if (mode === 'dark') {
    root.style.setProperty('--vayzo-background', '#0f172a');
    root.style.setProperty('--vayzo-surface', '#1e293b');
    root.style.setProperty('--vayzo-text-primary', '#f8fafc');
    root.style.setProperty('--vayzo-text-secondary', '#cbd5e1');
    root.style.setProperty('--vayzo-border', '#334155');
    root.classList.add('dark');
  } else if (mode === 'light') {
    root.style.setProperty('--vayzo-background', '#f8f8fb');
    root.style.setProperty('--vayzo-surface', '#ffffff');
    root.style.setProperty('--vayzo-text-primary', '#140f33');
    root.style.setProperty('--vayzo-text-secondary', '#5c5773');
    root.style.setProperty('--vayzo-border', '#e5e3eb');
    root.classList.remove('dark');
  }
};
