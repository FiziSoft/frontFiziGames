// src/theme.js
import { ref, watch, onMounted } from 'vue';

export const themes = {
  default: {
    '--bg-color': 'linear-gradient(90deg, rgba(65,41,90,1) 0%, rgba(47,7,67,1) 100%)',
    '--text-color': '#fff',
    '--gradient-color': 'linear-gradient(to right, #DA22FF 0%, #9733EE 51%, #DA22FF 100%)',
    '--btn-gradient-color': 'linear-gradient(to right, #DA22FF, #9733EE)',
    '--btn-delete-color': '#fff',
    '--fizi-gradient': 'linear-gradient(to right, #FF512F, #DD2476)',
    '--border-color': '#fff',
    '--burger-color': '#fff'
  },
  theme1: {
    '--bg-color': '#ff7e5f',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #ff7e5f, #ffb27d)',
    '--btn-gradient-color': 'linear-gradient(to right, #ff4e50, #f9d423)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #6A82FB, #FC5C7D)',
    '--border-color': '#000',
    '--burger-color': '#000'
  },
  theme2: {
    '--bg-color': '#9733ee',
    '--text-color': '#fff',
    '--gradient-color': 'linear-gradient(to right, #9733ee, #da22ff)',
    '--btn-gradient-color': 'linear-gradient(to right, #6a11cb, #2575fc)',
    '--btn-delete-color': '#fff',
    '--fizi-gradient': 'linear-gradient(to right, #FF5F6D, #FFC371)',
    '--border-color': '#fff',
    '--burger-color': '#fff'
  },
  theme3: {
    '--bg-color': '#f9f9a1',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #f9f9a1, #fce16b)',
    '--btn-gradient-color': 'linear-gradient(to right, #ffdd00, #fbb034)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #00F260, #0575E6)',
    '--border-color': '#000',
    '--burger-color': '#000'
  },
  theme4: {
    '--bg-color': '#f8c4d4',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #f8c4d4, #f7a3b0)',
    '--btn-gradient-color': 'linear-gradient(to right, #ff758c, #ff7eb3)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #8E2DE2, #4A00E0)',
    '--border-color': '#000',
    '--burger-color': '#000'
  },
};

export const useTheme = () => {
  const currentTheme = ref(localStorage.getItem('theme') || 'default');

  const applyTheme = (theme) => {
    const themeProperties = themes[theme];
    for (const prop in themeProperties) {
      document.documentElement.style.setProperty(prop, themeProperties[prop], 'important');
    }
    localStorage.setItem('theme', theme);
  };

  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
  });

  onMounted(() => {
    applyTheme(currentTheme.value);
  });

  return {
    currentTheme,
    setTheme: (theme) => {
      currentTheme.value = theme;
    }
  };
};
