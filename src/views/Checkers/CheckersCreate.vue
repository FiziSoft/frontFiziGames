<template>
  <GameLayout :name-game="$t('games.checkers.name')">
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
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GameLayout from "../GameLayout.vue";
import { url_serv_checkers } from "@/link";

// Инициализация i18n и маршрутизации
const { locale, t } = useI18n();
const router = useRouter();

// Получение языка из localStorage или установка 'ua' по умолчанию
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;

// Переменные и функции компонента
const playerName = ref(localStorage.getItem('playerName') || '');
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});

const createRoom = async () => {
  try {
    const response = await axios.post(`${url_serv_checkers}/api/create-room`);
    const { roomId, adminId } = response.data;
    localStorage.setItem('playerName', playerName.value);
    localStorage.setItem('checkersAdminId', adminId);
    router.push({ name: 'CheckersGameRoom', params: { roomId, playerId: adminId } }).then(() => {
      window.location.reload(); // Обновляем страницу один раз после перенаправления
    });
  } catch (error) {
    console.error('Error creating room:', error);
    errorMessage.value = t('games.checkers.error_occurred');
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
