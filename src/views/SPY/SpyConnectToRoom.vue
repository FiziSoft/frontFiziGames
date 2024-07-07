<template>
  <GameLayout nameGame="Камінь Ножиці Бумага">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="redirectToRoomPage" class="btn-grad"> Долучитись до гри </button>
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
import { v4 as uuidv4 } from 'uuid';
import {url_serv} from './SpyCreateRoom.vue'

const router = useRouter();
const route = useRoute();
const playerName = ref(localStorage.getItem('spyPlayerName') || '');
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});





const redirectToRoomPage = async () => {
  try {
    const roomId = route.params.id;
    const encodedName = encodeURIComponent(playerName.value);
    localStorage.setItem('spyPlayerName', playerName.value);

    if (!localStorage.getItem('spyPlayerHash')) {
      localStorage.setItem('spyPlayerHash', uuidv4());
    }

    const playerHash = localStorage.getItem('spyPlayerHash');

    // Проверяем, существует ли комната
    const response = await axios.get(`https://${url_serv}/rooms/${roomId}`);
    if (response.status === 200 && response.data) {
      alert("ok")
      localStorage.setItem('spyRoomId', roomId);
      router.push({ name: 'spyGameRoom', params: { id: roomId, playerHash } }).then(() => {
        window.location.reload(); // Обновляем страницу один раз после перенаправления
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert("ne ok")

      errorMessage.value = "Комната не существует. Пожалуйста, проверьте ID комнаты и попробуйте снова.";
    } else {
      console.error('Error checking room:', error);
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
