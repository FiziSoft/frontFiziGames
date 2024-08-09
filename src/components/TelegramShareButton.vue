<template>
  <div class="share-buttons">
    <qrcode-vue :value="props.url" :size="128" class="qrShare"></qrcode-vue>

    <button @click="shareToWhatsApp" class="share-button whatsapp">
      <img src="@/assets/whatsapp.png" alt="WhatsApp" class="icon" />
    </button>

    <button @click="shareToViber" class="share-button viber">
      <img src="@/assets/viber.png" alt="Viber" class="icon" />
    </button>

    <button @click="shareToTelegram" class="share-button telegram">
      <img src="@/assets/telegram.png" alt="Telegram" class="icon" />
    </button>

    <button class="btn-grad" @click.prevent="copyToClipboard">Копировать ссылку</button>

    <div v-if="showNotification" class="notification">Ссылка скопирована в буфер обмена!</div>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import QrcodeVue from '@chenfengyuan/vue-qrcode';

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: false,
    default: ''
  }
});

const showNotification = ref(false);

const shareToTelegram = () => {
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.text)}`;
  window.open(telegramUrl, '_blank');
};

const shareToWhatsApp = () => {
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(props.text)}%20${encodeURIComponent(props.url)}`;
  window.open(whatsappUrl, '_blank');
};

const shareToViber = () => {
  const viberUrl = `viber://forward?text=${encodeURIComponent(props.text)}%20${encodeURIComponent(props.url)}`;
  window.open(viberUrl, '_blank');
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.url).then(() => {
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 3000); // Уведомление исчезает через 3 секунды
  }).catch(err => {
    console.error('Ошибка копирования в буфер обмена: ', err);
  });
};
</script>

<style scoped>
.copy-button {
  color: white;
  background-color: #007bff;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
  font-size: 16px;
}

.copy-button:hover {
  background-color: #0056b3;
}

.share-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-button {
  padding: 10px;
  margin: 10px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-button:hover {
  background-color: #0077b3;
}

.share-button.whatsapp:hover {
  background-color: #1EBE53;
}

.share-button.viber:hover {
  background-color: #58499B;
}

.icon {
  width: auto;
  height: 45px;
}

.qrShare {
  margin-top: 20px;
}

.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  color: green;
  padding: 10px 20px;
  border: 1px solid green;
  border-radius: 5px;
  opacity: 1;
  animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
