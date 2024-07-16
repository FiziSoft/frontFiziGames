<template>
    <GameLayout nameGame="Code names">
      <div>
        <h2>Слова</h2>
        <div :class="`grid grid-${words.length}`">
          <div
            v-for="word in words"
            :key="word"
            class="word"
            :class="{ revealed: !!revealedWords[word], red: revealedWords[word] === 'red', blue: revealedWords[word] === 'blue', neutral: revealedWords[word] === 'neutral', bomb: revealedWords[word] === 'bomb' }"
          >
            {{ word }}
          </div>
        </div>
      </div>
      <ShareButton :url="url_share"></ShareButton>
    </GameLayout>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import GameLayout from '../GameLayout.vue';
  import ShareButton from '@/components/ShareButton.vue';
  
  const route = useRoute();
  const gameId = route.params.gameId;
  const words = ref([]);
  const revealedWords = ref({});
  let socket;
  const url_share = `http://localhost:8080/codenames/player-view/${gameId}`;
  
  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8001/ws/${gameId}`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    try {
      socket = new WebSocket(wsUrl);
  
      socket.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      socket.onmessage = (event) => {
        console.log('Received message:', event.data);
        const message = JSON.parse(event.data);
        if (message.type === "reveal") {
          revealedWords.value[message.word] = message.role;
        } else if (message.type === "initialize") {
          words.value = message.words;
          revealedWords.value = message.revealedWords;
        }
      };
  
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };
  
  onMounted(() => {
    connectWebSocket();
  });
  </script>
  
  <style>
 
  </style>
  