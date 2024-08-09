<template>
  <GameLayout :name-game="$t('games.battleSee.name')">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">{{ $t('games.battleSee.name_player') }}</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="joinRoom" class="btn-grad">{{ $t('games.battleSee.join') }}</button>
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
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GameLayout from "../GameLayout.vue";
import { url_serv_battle_sea } from "@/link";

// Инициализация i18n и маршрутизации
const { locale, t } = useI18n();
const router = useRouter();
const route = useRoute();

// Получение языка из localStorage или установка 'ua' по умолчанию
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;

// Переменные и функции компонента
const playerName = ref(localStorage.getItem('playerName') || '');
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});

const joinRoom = async () => {
  try {
    const roomId = route.params.roomId;
    if (!roomId) {
      errorMessage.value = t('games.battleSee.missing_room_id');
      return;
    }

    const response = await axios.post(`${url_serv_battle_sea}/api/join-room/${roomId}`, { name: playerName.value });
    const { playerId } = response.data;
    localStorage.setItem('playerName', playerName.value);
    localStorage.setItem('seaBattlePlayerId', playerId);
    router.push({ name: 'BattleSeeGameRoom', params: { roomId, playerId, locale: locale.value } }).then(() => {
      window.location.reload(); // Обновляем страницу один раз после перенаправления
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      errorMessage.value = t('games.battleSee.room_not_found');
    } else if (error.response && error.response.status === 403) {
      errorMessage.value = t('games.battleSee.room_full');
    } else {
      console.error('Error joining room:', error);
      errorMessage.value = t('games.battleSee.error_occurred');
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
