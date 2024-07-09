<template>
  <GameLayout nameGame="Камінь Ножиці Бумага">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="" class="input-gradient">
        </div>

        <div class="formElement">
          <label class="">
              Кількість гравців:
          </label>
          <input v-model="numPlayers" class="input-gradient" placeholder=" " />
        </div>

        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="sendCreateRoomRequest" class="btn-grad"> Почати гру </button>
        </div>
      </form>
    </div>
  </GameLayout>
</template>

<script setup>
import axios from "axios";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import GameLayout from "../GameLayout.vue";


const playerName = ref(localStorage.getItem('playerName'))
const numPlayers = ref(null);
const router = useRouter();
// const serv_url = "localhost:8000"
const serv_url = "rsp-f1c55df7ba69.herokuapp.com"

const isButtonActive = computed(() => {
  return playerName.value && numPlayers.value;
});

const sendCreateRoomRequest = async () => {
  try {
    const response = await axios.post(`https://${serv_url}/create_room`, {
      name: playerName.value,
      req_players: numPlayers.value
    });

    const roomId = response.data.id;
    localStorage.setItem('playerName', playerName.value);
    router.push({ name: 'RspGameRoom', params: { id: roomId } });
  } catch (error) {
    console.error('Error creating room:', error);
  }
};
</script>

<style>
/* Добавьте ваши стили здесь */
</style>
