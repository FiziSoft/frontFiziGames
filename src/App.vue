<template>
  <div class="app-container">
    <ThemeProvider>
      <div v-if="loading" class="loader"></div>
      <router-view v-else />
      <FooterComponent @themeChange="handleThemeChange" />
    </ThemeProvider>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FooterComponent from '@/components/FooterComponent.vue';
import ThemeProvider from '@/components/ThemeProvider.vue';
import { setLocale } from '@/i18n';  // Импортируем функцию для смены языка

const loading = ref(true); // Добавляем состояние для загрузки
const currentTheme = ref('theme2');

const handleThemeChange = (theme) => {
  currentTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);  // Сохраняем тему в localStorage
};

onMounted(async () => {
  // Загрузка и установка сохраненной темы
  const savedTheme = localStorage.getItem('theme') || 'theme2';
  currentTheme.value = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Загрузка и установка сохраненного языка
  const savedLanguage = localStorage.getItem('language') || 'ua';
  try {
    await setLocale(savedLanguage);
    console.log('Locale set to:', savedLanguage);
  } catch (error) {
    console.error('Failed to set locale:', error);
  } finally {
    loading.value = false; // Убираем лоадер после загрузки
  }
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
