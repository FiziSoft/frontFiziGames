<template>
  <div class="containerFormCreate">
    <form class="formCreate" @submit.prevent="createAndJoinRoom">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

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

const isButtonActive = computed(() => playerName.value.trim().length > 0 && (playerPhoto.value || cartoonPhoto.value));

const onFileChange = (e) => {
  const file = e.target.files[0];
  playerPhoto.value = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    playerPhotoPreview.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const uploadPhoto = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', playerPhoto.value);
    // formData.append('text', 'portrait of a funny avatar');
    formData.append('text', 'portrait of a very funny avatar anime');

    const resp = await fetch('https://api.deepai.org/api/image-editor', {
      method: 'POST',
      headers: {
        'api-key': 'a34c51f1-0d6e-4c27-a10e-28005f33620a'
      },
      body: formData
    });

    const data = await resp.json();
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

const createAndJoinRoom = async () => {
  localStorage.setItem('playerName', playerName.value);

  const createResponse = await fetch('http://localhost:8002/create_room', {
    method: 'POST',
  });
  const { room_id } = await createResponse.json();

  const formData = new FormData();
  formData.append('room_id', room_id);
  formData.append('player_id', playerId.value);
  formData.append('player_name', playerName.value);
  formData.append('player_photo', cartoonPhoto.value || playerPhoto.value);

  const joinResponse = await fetch('http://localhost:8002/join_room', {
    method: 'POST',
    body: formData
  });
  const { player_id } = await joinResponse.json();
  localStorage.setItem('LoseFriends_playerId', player_id);

  router.push({ name: 'LoseFriendsGameRoom', params: { roomId: room_id } });
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
