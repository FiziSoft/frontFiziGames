<template>
    <GameLayout nameGame="Code names">
      <div id="app" class="form-create">
        <h1>Гра Codenames</h1>
        <button @click="createGame(12)">Створити гру на 12 слів</button>
        <button @click="createGame(16)">Створити гру на 16 слів</button>
        <button @click="createGame(20)">Створити гру на 20 слів</button>
        <button @click="createGame(25)">Створити гру на 25 слів</button>
      </div>
    </GameLayout>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import GameLayout from '../GameLayout.vue';
  
  const router = useRouter();
  
  const createGame = async (numWords) => {
    try {
      const response = await axios.post(`http://localhost:8001/create_game/${numWords}`);
      const { game_id } = response.data;
      router.push({ 
        name: 'codenames-gameboard', 
        params: { 
          gameId: game_id
        } 
      });
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };
  </script>
  