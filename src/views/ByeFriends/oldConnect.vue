<template>
  <GameLayout name-game="Як втратити друзів">
    <div class="containerFormJoin">
      <form class="formJoin" @submit.prevent="joinGame">
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
          <button :disabled="!isButtonActive" type="submit" class="btn-grad">Присоединиться к игре</button>
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
import { useRoute, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import GameLayout from '../GameLayout.vue';
import { url_serv_lose_friends } from "@/link"

const playerName = ref(localStorage.getItem('playerName') || '');
const playerPhoto = ref(null);
const playerPhotoPreview = ref(null);
const cartoonPhoto = ref(localStorage.getItem('LoseFriends_cartoonPhoto') || null);
const loading = ref(false);
const hiddenFileInput = ref(null);
const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.roomId);

const triggerFileInput = () => {
  const inputElement = document.getElementById('playerPhoto');
  if (inputElement) {
    inputElement.click();
  } else {
    console.error('Element with id "playerPhoto" not found');
  }
};

let playerId = ref(localStorage.getItem('LoseFriends_playerId') || '');
if (!playerId.value || playerId.value === "undefined") {
  playerId.value = uuidv4();
  localStorage.setItem('LoseFriends_playerId', playerId.value);
}

let playerScore = ref(parseInt(localStorage.getItem('LoseFriends_score') || '0'));

const isButtonActive = computed(() => playerName.value.trim().length > 0 && (playerPhoto.value || cartoonPhoto.value));

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    playerPhoto.value = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      playerPhotoPreview.value = event.target.result;
      console.log('File selected:', playerPhotoPreview.value);
    };
    reader.readAsDataURL(file);
    await uploadPhoto();
  }
};

const uploadPhoto = async () => {
  loading.value = true;
  console.log('Uploading photo...');
  try {
    const formData = new FormData();
    formData.append('file', playerPhoto.value);

    console.log('FormData prepared:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    const resp = await fetch(`${url_serv_lose_friends}/generate_avatar/`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    console.log('Response from server:', data);
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

const removeAvatar = () => {
  cartoonPhoto.value = null;
  localStorage.removeItem('LoseFriends_cartoonPhoto');
};

const joinGame = async () => {
  console.log('Joining game...');
  localStorage.setItem('playerName', playerName.value);

  // Проверяем, совпадает ли текущий roomId с сохраненным
  const storedRoomId = localStorage.getItem('LoseFriends_roomId');
  if (storedRoomId !== roomId.value) {
    playerScore.value = 0;  // Обнуляем очки игрока, если комната новая
  }
  console.log('Player Score:', playerScore.value);

  const formData = new URLSearchParams();
  formData.append('room_id', roomId.value);
  formData.append('player_id', playerId.value);
  formData.append('player_name', playerName.value);
  formData.append('player_photo', cartoonPhoto.value);
  formData.append('player_score', playerScore.value.toString());

  console.log('FormData:', formData.toString());

  const joinResponse = await fetch(`${url_serv_lose_friends}/join_room`, {
    method: 'POST',
    body: formData
  });

  const responseData = await joinResponse.json();
  console.log('Join response:', responseData);

  if (!joinResponse.ok) {
    console.error('Error joining room:', responseData);
    return;
  }

  // Обновляем очки игрока на основе данных с сервера
  playerScore.value = responseData.player_score || 0;
  localStorage.setItem('LoseFriends_score', playerScore.value);

  localStorage.setItem('LoseFriends_roomId', roomId.value); // Сохраняем текущий roomId
  router.push({ name: 'LoseFriendsGameRoom', params: { roomId: roomId.value } });
};
</script>

<style>
.photoUp {
  border: 1px solid;
}

.containerFormJoin {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.formJoin {
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