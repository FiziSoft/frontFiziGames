<template>
  <GameLayout :name-game="$t('games.battleSee.name')">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">{{ $t('games.battleSee.name_player') }}</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="createRoom" class="btn-grad">{{ $t('games.battleSee.create') }}</button>
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
import { url_serv_battle_sea, url_stat } from "@/link";

// Получаем и устанавливаем локаль
const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

// Получаем язык из localStorage или устанавливаем по умолчанию
const savedLocale = localStorage.getItem('language') || 'en'; // 'en' как язык по умолчанию
locale.value = savedLocale;

// Обновляем локаль, если параметр locale присутствует в маршруте
if (route.params.locale && route.params.locale !== locale.value) {
  locale.value = route.params.locale;
  localStorage.setItem('language', route.params.locale); // сохраняем новую локаль в localStorage
}

// Следим за изменениями в маршруте и обновляем локаль
watch(() => route.params.locale, (newLocale) => {
  if (newLocale && newLocale !== locale.value) {
    locale.value = newLocale;
    localStorage.setItem('language', newLocale); // сохраняем новую локаль в localStorage
  }
});

const playerName = ref(localStorage.getItem('playerName') || '');
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});

const createRoom = async () => {
  try {
    const response = await axios.post(`${url_serv_battle_sea}/api/create-room`, { name: playerName.value });
    const { roomId, adminId } = response.data;
    localStorage.setItem('playerName', playerName.value);
    localStorage.setItem('seaBattleAdminId', adminId);


   axios.post(url_stat, {
      game_id: 2,
      room_number: roomId,
      creator_name: playerName.value,
      language: locale.value,
      player_count: 2,
      is_local: false,
      
    });

    router.push({ name: 'BattleSeeGameRoom', params: { roomId, playerId: adminId, locale: locale.value } }).then(() => {
      window.location.reload(); // Обновляем страницу один раз после перенаправления
    });
  } catch (error) {
    console.error('Error creating room:', error);
    errorMessage.value = `$t('games.battleSee.error_creating_room')`; // Локализованное сообщение об ошибке
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
