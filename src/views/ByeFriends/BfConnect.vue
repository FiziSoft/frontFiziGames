<template>
  <GameLayout name-game="Як втратити друзів">
    <div class="containerFormCreate">
      <form class="formCreate" @submit.prevent="createAndJoinRoom">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="formElement">
          <label class="btn-gradient-1" for="playerPhoto">Аватарка</label>
          <input type="file" @change="onFileChange" id="playerPhoto" accept="image/*" capture="environment" class="input-file photoUp">
          <div class="input-gradient" @click="triggerFileInput">Сделать фото</div>
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="submit" class="btn-grad">Создать и подключиться к комнате</button>
        </div>
      </form>
      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-if="cartoonPhoto" class="preview">
        <h3>Ваш аватар</h3>
        <img :src="cartoonPhoto" alt="Мультяшная аватарка" class="photo-preview">
        <button @click="removeAvatar" class="btn-grad">Изменить аватар</button>
      </div>
      <input type="file" ref="hiddenFileInput" @change="onFileChange" accept="image/*" capture="environment" style="display: none;">
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import GameLayout from '../GameLayout.vue';
import { url_serv_lose_friends } from "@/link"

const playerName = ref(localStorage.getItem('playerName') || '');
const playerPhoto = ref(null);
const playerPhotoPreview = ref(null);
const cartoonPhoto = ref(localStorage.getItem('LoseFriends_cartoonPhoto') || null);
const loading = ref(false);
const hiddenFileInput = ref(null);
const router = useRouter();

const playerId = ref(localStorage.getItem('LoseFriends_playerId'));
if (!playerId.value || playerId.value === "undefined") {
  playerId.value = uuidv4();
  localStorage.setItem('LoseFriends_playerId', playerId.value);
}

// Определяем переменную playerScore
const playerScore = ref(parseInt(localStorage.getItem('LoseFriends_score') || '0'));

const triggerFileInput = () => {
  const inputElement = document.getElementById('playerPhoto');
  if (inputElement) {
    inputElement.click();
  } else {
    console.error('Element with id "playerPhoto" not found');
  }
};

const isButtonActive = computed(() => playerName.value.trim().length > 0 && (playerPhoto.value || cartoonPhoto.value));

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    playerPhoto.value = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      playerPhotoPreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
    await uploadPhoto();
  }
};

const uploadPhoto = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', playerPhoto.value);

    const resp = await fetch(`${url_serv_lose_friends}/generate_avatar/`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    if (data.url) {
      cartoonPhoto.value = `${url_serv_lose_friends}${data.url}`;
      localStorage.setItem('LoseFriends_cartoonPhoto', cartoonPhoto.value);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
  } finally {
    loading.value = false;
  }
};

const createAndJoinRoom = async () => {
  if (!cartoonPhoto.value && playerPhoto.value) {
    await uploadPhoto();
  }

  localStorage.setItem('playerName', playerName.value);

  // Создание новой комнаты
  const createResponse = await fetch(`${url_serv_lose_friends}/create_room`, {
    method: 'POST',
  });
  const { room_id } = await createResponse.json();

  // Обнуление очков при создании новой комнаты
  playerScore.value = 0;
  localStorage.setItem('LoseFriends_score', '0');

  const formData = new URLSearchParams();
  formData.append('room_id', room_id);
  formData.append('player_id', playerId.value);
  formData.append('player_name', playerName.value);
  formData.append('player_photo', cartoonPhoto.value || playerPhoto.value);
  formData.append('player_score', '0'); // Очки обнуляются при создании новой комнаты

  const joinResponse = await fetch(`${url_serv_lose_friends}/join_room`, {
    method: 'POST',
    body: formData
  });

  localStorage.setItem('LoseFriends_roomId', room_id); // Сохраняем текущий roomId
  router.push({ name: 'LoseFriendsGameRoom', params: { roomId: room_id } });
};

const removeAvatar = () => {
  cartoonPhoto.value = null;
  localStorage.removeItem('LoseFriends_cartoonPhoto');
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
.input-file {
  display: none;
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
.preview {
  text-align: center;
  margin-bottom: 20px;
}
.photo-preview {
  max-width: 50%;
  height: auto;
  border-radius: 50%;
  border: 2px solid #ff7e5f;
}
.loading {
  text-align: center;
  font-weight: bold;
}
</style>
