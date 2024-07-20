<template>
    <div class="app-container">
      <ThemeProvider>
      <router-view />
      <FooterComponent @themeChange="handleThemeChange" />
    </ThemeProvider>
      
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import FooterComponent from '@/components/FooterComponent.vue';
  import ThemeProvider from '@/components/ThemeProvider.vue';

  const currentTheme = ref('default');
  
  const handleThemeChange = (theme) => {
    currentTheme.value = theme;
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    currentTheme.value = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  });
  </script>
  
  <style lang="sass">
  .app-container
    display: flex
    flex-direction: column
    min-height: 100vh
    height: 100%
  router-view
    flex: 1
  </style>
  