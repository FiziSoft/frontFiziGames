<template>
  <div class="containerFormCreate">
    <form class="formCreate" @submit.prevent="uploadPhoto">
      <div class="formElement">
        <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
        <input v-model="playerName" type="text" id="playerName" class="input-gradient">
      </div>
      <div class="formElement">
        <label class="btn-gradient-1" for="playerPhoto">Ваше фото:</label>
        <input type="file" @change="onFileChange" id="playerPhoto" accept="image/*" class="input-gradient">
      </div>
      <div class="btnDiv">
        <button :disabled="!isButtonActive" type="submit" class="btn-grad">Долучитись до гри</button>
      </div>
    </form>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="playerPhotoPreview" class="preview">
      <h3>Загруженная фотография</h3>
      <img :src="playerPhotoPreview" alt="Предварительный просмотр" class="photo-preview">
    </div>
    <div v-if="cartoonPhoto" class="preview">
      <h3>Мультяшная аватарка</h3>
      <img :src="cartoonPhoto" alt="Мультяшная аватарка" class="photo-preview">
    </div>
    <input type="file" ref="hiddenFileInput" @change="onFileChange" accept="image/*" capture="environment" style="display: none;">
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const playerName = ref(localStorage.getItem('playerName') || '');
const playerPhoto = ref(null);
const playerPhotoPreview = ref(null);
const cartoonPhoto = ref(null);
const loading = ref(false);
const hiddenFileInput = ref(null);

const isButtonActive = computed(() => playerName.value.trim().length > 0 && playerPhoto.value);

const onFileChange = (e) => {
  const file = e.target.files[0];
  playerPhoto.value = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    playerPhotoPreview.value = event.target.result;
    console.log('File selected:', playerPhotoPreview.value); // Debugging line
  };
  reader.readAsDataURL(file);
};

const uploadPhoto = async () => {
  loading.value = true;
  console.log('Uploading photo...'); // Debugging line
  try {
    const formData = new FormData();
    formData.append('image', playerPhoto.value);
    formData.append('text', 'portrait of a funny avatar'); // Adding description

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
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
  } finally {
    loading.value = false;
  }
};

const capturePhoto = () => {
  hiddenFileInput.value.click();
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
