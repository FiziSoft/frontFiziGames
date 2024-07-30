<template>
  <GameLayout name-game="Морський Бій">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="createRoom" class="btn-grad">Создать комнату</button>
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
import GameLayout from "../GameLayout.vue";

// const url_serv = "http://localhost:7001";  // или ваш сервер
const url_serv = "https://seabattle-acb2eb1faa50.herokuapp.com";

const router = useRouter();
const playerName = ref(localStorage.getItem('playerName') || '');
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});

const createRoom = async () => {
  try {
    const response = await axios.post(`${url_serv}/api/create-room`, { name: playerName.value });
    const { roomId, adminId } = response.data;
    localStorage.setItem('playerName', playerName.value);
    localStorage.setItem('seaBattleAdminId', adminId);
    router.push({ name: 'BattleSeeGameRoom', params: { roomId, playerId: adminId } }).then(() => {
      window.location.reload(); // Обновляем страницу один раз после перенаправления
    });
  } catch (error) {
    console.error('Error creating room:', error);
    errorMessage.value = "Произошла ошибка при создании комнаты. Пожалуйста, попробуйте снова позже.";
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
