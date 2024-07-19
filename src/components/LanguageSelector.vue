<template>
    <div class="language-selector">
      <img src="path/to/uk-flag.svg" @click="setLanguage('uk')" alt="Українська" />
      <img src="path/to/ru-flag.svg" @click="setLanguage('ru')" alt="Русский" />
      <img src="path/to/en-flag.svg" @click="setLanguage('en')" alt="English" />
    </div>
  </template>
  
  <script setup>
  import {onMounted} from 'vue'
  import { useI18n } from 'vue-i18n';
  
  const { locale } = useI18n();
  
  const setLanguage = (lang) => {
    locale.value = lang;
    localStorage.setItem('language', lang);
  };
  
  onMounted(() => {
    const savedLanguage = localStorage.getItem('language') || 'uk';
    locale.value = savedLanguage;
  });
  </script>
  
  <style scoped>
  .language-selector img {
    width: 30px;
    height: 20px;
    cursor: pointer;
    margin: 0 5px;
  }
  </style>
  