<template>
  <div class="containerFormJoin">
    <form class="formJoin" @submit.prevent="joinGame">
      <div class="formElement">
        <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
        <input v-model="playerName" type="text" id="playerName" class="input-gradient">
      </div>
      <div class="formElement">
        <label class="btn-gradient-1" for="playerPhoto">Выбрать или сделать фото:</label>
        <input type="file" @change="onFileChange" id="playerPhoto" accept="image/*" class="input-file">
      </div>
      <div class="btnDiv" v-if="!cartoonPhoto">
        <button :disabled="!isButtonActive" @click="uploadPhoto" type="button" class="btn-grad">Загрузить аватар</button>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

const playerName = ref(localStorage.getItem('playerName') || '');
const playerPhoto = ref(null);
const playerPhotoPreview = ref(null);
const cartoonPhoto = ref(localStorage.getItem('LoseFriends_cartoonPhoto') || null);
const loading = ref(false);
const hiddenFileInput = ref(null);
const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.roomId);

// Определим playerId, если он не существует
let playerId = ref(localStorage.getItem('LoseFriends_playerId') || '');
if (!playerId.value || playerId.value === "undefined") {
  playerId.value = uuidv4();
  localStorage.setItem('LoseFriends_playerId', playerId.value);
}

const isButtonActive = computed(() => playerName.value.trim().length > 0 && (playerPhoto.value || cartoonPhoto.value));

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    playerPhoto.value = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      playerPhotoPreview.value = event.target.result;
      console.log('File selected:', playerPhotoPreview.value); // Debugging line
    };
    reader.readAsDataURL(file);
  }
};

const uploadPhoto = async () => {
  loading.value = true;
  console.log('Uploading photo...'); // Debugging line
  try {
    const formData = new FormData();
    formData.append('image', playerPhoto.value);
    // formData.append('text', 'portrait of a funny avatar'); // Adding description
    // formData.append('text', 'portrait of a funny avatar anime');
    formData.append('text', 'portrait of a funny avatar anime baby face');



    console.log('FormData prepared:'); // Debugging line
    formData.forEach((value, key) => {
      console.log(key, value); // Debugging line
    });

    const resp = await fetch('https://api.deepai.org/api/image-editor', {
      method: 'POST',
      headers: {
        'api-key': 'a34c51f1-0d6e-4c27-a10e-28005f33620a'
      },
      body: formData
    });

    const data = await resp.json();
    console.log('Response from server:', data); // Debugging line
    if (data.output_url) {
      cartoonPhoto.value = data.output_url;
      localStorage.setItem('LoseFriends_cartoonPhoto', data.output_url);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
  } finally {
    loading.value = false;
  }
};

const joinGame = async () => {
  localStorage.setItem('playerName', playerName.value);

  // Присоединяемся к комнате
  const formData = new URLSearchParams();
  formData.append('room_id', roomId.value);
  formData.append('player_id', playerId.value); // Убедитесь, что значение передается как строка
  formData.append('player_name', playerName.value);
  formData.append('player_photo', cartoonPhoto.value);

  const joinResponse = await fetch('http://localhost:8002/join_room', {
    method: 'POST',
    body: formData
  });

  if (!joinResponse.ok) {
    console.error('Error joining room:', await joinResponse.text());
    return;
  }

  // Перенаправление в игровую комнату
  router.push({ name: 'LoseFriendsGameRoom', params: { roomId: roomId.value } });
};

const removeAvatar = () => {
  cartoonPhoto.value = null;
  localStorage.removeItem('LoseFriends_cartoonPhoto');
};

onMounted(() => {
  if (cartoonPhoto.value) {
    console.log('Loaded cartoon photo from local storage');
  }
});
</script>

<style>
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
