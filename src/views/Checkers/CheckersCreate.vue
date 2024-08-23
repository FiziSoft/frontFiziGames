<template>
    <GameLayout name-game="checkers')">
      <div class="containerFormCreate">
        <form class="formCreate">
          <div class="formElement">
            <label class="btn-gradient-1" for="playerName">{{ $t('games.checkers.name_player') }}</label>
            <input v-model="playerName" type="text" id="playerName" class="input-gradient">
          </div>
          <div class="btnDiv">
            <button :disabled="!isButtonActive" type="button" @click="createRoom" class="btn-grad">{{ $t('games.checkers.create') }}</button>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </GameLayout>
  </template>
  
  <script setup>
  import axios from "axios";
  import { ref, computed, watch } from "vue";
  import { useRouter, useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import GameLayout from "../GameLayout.vue";
  import { url_serv_checkers } from "@/link";
  
  const { t, locale } = useI18n();
  const route = useRoute();
  const router = useRouter();
  
  const savedLocale = localStorage.getItem('language') || 'en';
  locale.value = savedLocale;
  
  if (route.params.locale && route.params.locale !== locale.value) {
    locale.value = route.params.locale;
    localStorage.setItem('language', route.params.locale);
  }
  
  watch(() => route.params.locale, (newLocale) => {
    if (newLocale && newLocale !== locale.value) {
      locale.value = newLocale;
      localStorage.setItem('language', newLocale);
    }
  });
  
  const playerName = ref(localStorage.getItem('playerName') || '');
  const errorMessage = ref('');
  const isButtonActive = computed(() => {
    return playerName.value.trim().length > 0;
  });
  
  const createRoom = async () => {
    try {
      const response = await axios.post(`${url_serv_checkers}/api/create-room`, { name: playerName.value, language: locale.value});
      const { roomId, adminId } = response.data;
      localStorage.setItem('playerName', playerName.value);
      localStorage.setItem('checkersAdminId', adminId);
  
      router.push({ name: 'CheckersGameRoom', params: { roomId, playerId: adminId, locale: locale.value } });
    } catch (error) {
      console.error('Error creating room:', error);
      errorMessage.value = t('games.checkers.error_creating_room');
    }
  };
  </script>
  
  <style scoped>
  .error-message {
    color: red;
    margin-top: 10px;
  }
  </style>
  