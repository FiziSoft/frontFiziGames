<template>
    <GameLayout name-game="Морський Бій">
      <div class="containerFormCreate">
        <form class="formCreate">
          <div class="formElement">
            <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
            <input v-model="playerName" type="text" id="playerName" class="input-gradient">
          </div>
          <div class="btnDiv">
            <button :disabled="!isButtonActive" type="button" @click="joinRoom" class="btn-grad">Долучитись до гри</button>
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
  import GameLayout from "../GameLayout.vue";
  import { url_serv_battle_sea } from "@/link";


  const router = useRouter();
  const route = useRoute();
  const playerName = ref(localStorage.getItem('playerName') || '');
  const errorMessage = ref('');
  const isButtonActive = computed(() => {
    return playerName.value.trim().length > 0;
  });
  
  const joinRoom = async () => {
    try {
      const roomId = route.params.roomId;
      if (!roomId) {
        errorMessage.value = "ID комнаты отсутствует. Пожалуйста, проверьте URL и попробуйте снова.";
        return;
      }
      
      const response = await axios.post(`${url_serv_battle_sea}/api/join-room/${roomId}`, { name: playerName.value });
      const { playerId } = response.data;
      localStorage.setItem('playerName', playerName.value);
      localStorage.setItem('seaBattlePlayerId', playerId);
      router.push({ name: 'BattleSeeGameRoom', params: { roomId, playerId } }).then(() => {
        window.location.reload(); // Обновляем страницу один раз после перенаправления
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        errorMessage.value = "Комната не существует. Пожалуйста, проверьте ID комнаты и попробуйте снова.";
      } else if (error.response && error.response.status === 403) {
        errorMessage.value = "Комната уже заполнена.";
      } else {
        console.error('Error joining room:', error);
        errorMessage.value = "Произошла ошибка. Пожалуйста, попробуйте снова позже.";
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
  