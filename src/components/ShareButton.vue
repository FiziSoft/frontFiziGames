<template>
  <div>
    <div class="share-button" @click="openModal">
      <i class="fas fa-paper-plane"></i>
    </div>
    <div v-if="isModalOpen" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <span class="close" @click="closeModal"><i class="fas fa-times"></i></span>
        <TelegramShareButton :url="url" :text="text" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import TelegramShareButton from './TelegramShareButton.vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
}

const closeModal = () => {
  isModalOpen.value = false;
}
</script>

<style scoped>
.share-button {
  position: relative;
  bottom: 0px;
  left: 0;
  width: 70px;
  height: 70px;
  background-color: #007bff;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.share-button i {
  pointer-events: none;
  margin-left: -6px;
  /* margin-top: 20px; */
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  width: 300px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: black;
  cursor: pointer;
}
</style>
