<template>
  <GameLayout nameGame="Камінь Ножиці Бумага">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="" class="input-gradient">
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="redirectToRoomPage" class="btn-grad">Долучитись до гри</button>
        </div>
      </form>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const playerName = ref(localStorage.getItem('playerName') || '');

const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});

const redirectToRoomPage = async () => {
  const roomId = route.params.id;
  localStorage.setItem('playerName', playerName.value);
  router.push({ name: 'GameRoom', params: { id: roomId } });
};
</script>
    
    <style>
    
    </style>