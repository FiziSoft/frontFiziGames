<template>
  <GameLayout name-game="Як втратити друзів">
    <div class="containerFormCreate">
      <form class="formCreate" @submit.prevent="createAndJoinRoom">
     
        <div class="btnDiv">
          <button  type="submit" class="btn-grad">Создать комнату</button>
        </div>
      </form>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import GameLayout from '../GameLayout.vue';
import { url_serv_lose_friends } from "@/link"

const router = useRouter();





const createAndJoinRoom = async () => {


  // Создание новой комнаты
  const createResponse = await fetch(`${url_serv_lose_friends}/create_room`, {
    method: 'POST',
  });
  const { room_id } = await createResponse.json();

  
  router.push({ name: 'LoseFriendsConnect', params: { roomId: room_id } });
};
</script>

<style>
.containerFormCreate {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.formCreate {
  display: flex;
  flex-direction: column;
  width: 300px;
}
.formElement {
  margin-bottom: 20px;
}
.input-gradient {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.24);
}
.btn-gradient-1 {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}
.btnDiv {
  text-align: center;
}
.btn-grad {
  background: linear-gradient(to right, #ff7e5f, #feb47b);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-grad:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
