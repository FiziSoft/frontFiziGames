<template>
  <GameLayout nameGame="Шпіон">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="formElement">
          <label class="">Кількість гравців:</label>
          <input v-model="numPlayers" class="input-gradient" placeholder=" " type="number" />
        </div>
        <div class="formElement">
          <label class="btn-gradient-1" for="time_game">Час на гру:</label>
          <input v-model="time_game" type="number" id="time_game" class="input-gradient">
        </div>
        <div class="formElement">
          <Dropdown_my :items="themes" v-model="theme_str" label="Тема гри:" />
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="sendCreateRoomRequest" class="btn-grad">Почати гру</button>
        </div>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </GameLayout>
</template>

<script setup charset="utf-8">
import axios from "axios";
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { v4 as uuidv4 } from 'uuid';
import GameLayout from "../GameLayout.vue";
import Dropdown_my from "/src/components/Dropdown_my.vue";
import network_url from "@/views/MainPage.vue";

const router = useRouter();
const route = useRoute();
const playerName = ref(localStorage.getItem('spyPlayerName') || '');
const numPlayers = ref(null);
const time_game = ref(null);
const theme_str = ref(null);
const themes = ref([]);
const errorMessage = ref('');
const gameState = ref('WaitPlayers');
const isSpy = ref(false);
const cur_world = ref('');
const room = reactive({ name: '', players: [], theme: [] });
const loading = ref(true);
const qrCodeValue = ref('');
const url_serv = "mysterious-eyrie-00377-cd0134972bbc.herokuapp.com";
// const url_serv = "127.0.0.1:7000";


const getThemes = async () => {
  try {
    const res = await axios.get(`https://${url_serv}/getThemes`);
    themes.value = res.data;
  } catch (error) {
    console.log('Error fetching themes:', error);
  }
};

onMounted(() => {
  getThemes();
});

const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0 && numPlayers.value && time_game.value && theme_str.value;
});

const sendCreateRoomRequest = async () => {
  try {
    const roomName = playerName.value;
    const encodedThemeStr = encodeURIComponent(theme_str.value);

    console.log('Creating room with params:', {
      name: roomName,
      req_players: numPlayers.value,
      time_game: time_game.value,
      theme_str: encodedThemeStr
    });

    const response = await axios.post(
      `https://${url_serv}/create_room`,
      null,
      {
        params: {
          name: roomName,
          req_players: numPlayers.value,
          time_game: time_game.value,
          theme_str: encodedThemeStr
        },
      }
    );

    const roomId = response.data.id;
    console.log('Room created with ID:', roomId);
    localStorage.setItem('spyPlayerName', playerName.value);
    localStorage.setItem('spyRoomId', roomId);

    if (!localStorage.getItem('spyPlayerHash')) {
      localStorage.setItem('spyPlayerHash', uuidv4());
    }

    router.push({ name: 'spyGameRoom', params: { id: roomId } }).then(() => {
      window.location.reload();
    });
  } catch (error) {
    console.error('Error creating room:', error);
    errorMessage.value = "Произошла ошибка при создании комнаты. Пожалуйста, попробуйте снова.";
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
