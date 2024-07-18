<template>
  <GameLayout nameGame="Code names">
    <div class="containerFormCreate">
      <div id="" class="formCreate">
        <strong>Гра Кодові імена</strong>
        <button class="btn-grad" @click="createGame(12)">Створити гру на 12 слів</button>
        <button class="btn-grad" @click="createGame(16)">Створити гру на 16 слів</button>
        <button class="btn-grad" @click="createGame(20)">Створити гру на 20 слів</button>
        <button class="btn-grad" @click="createGame(25)">Створити гру на 25 слів</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import GameLayout from '../GameLayout.vue';

const router = useRouter();
const url_api = 'https://codenames-72ce2135032c.herokuapp.com/'


const createGame = async (numWords) => {
  try {
    const response = await axios.post(`https://codenames-72ce2135032c.herokuapp.com/create_game/${numWords}`);
    const { game_id } = response.data;
    router.push({ 
      name: 'codenames-gameboard', 
      params: { 
        gameId: game_id,
        playerId: generatePlayerId() // Generate a player ID here
      } 
    });
  } catch (error) {
    console.error("Error creating game:", error);
  }
};

const generatePlayerId = () => {
  return 'player-' + Math.random().toString(36).substr(2, 9);
};
</script>
