<template>
  <div>
    <!-- <button @click="sendMessage" ref="sendButton" id="sendButton">Отправить сообщение</button> -->
    <ShareButton @share="handleShare" :url="todViewLink" text="Слідкуй за грою онлайн"/>
  </div>

  

</template>

<script setup>
import { ref, onMounted, defineExpose, defineProps, watch } from 'vue';
import ShareButton from '@/components/ShareButton.vue';
import network_url from '@/views/MainPage.vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  initialRoomId: {
    type: String,
    required: false
  },
  todUrlView: {
    type: String,
    required: true
  }
});

const isConnected = ref(false);
const socket = ref(null);
const roomId = ref(props.initialRoomId || null);
const roomUrl = ref(null);
const todViewLink = ref(props.todUrlView);

const sendButton = ref(null);

const sendMessage = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const message = {
      name: props.name,
      body: props.body,
      title: props.title
    };
    console.log('Отправка сообщения:', JSON.stringify(message));
    socket.value.send(JSON.stringify(message));
  } else {
    console.error('WebSocket не подключен.');
  }
};

const setupSocket = (url) => {
  socket.value = new WebSocket(url);
  socket.value.addEventListener('open', () => {
    console.log('WebSocket соединение установлено.');
    isConnected.value = true;
  });
  socket.value.addEventListener('message', (event) => {
    console.log('Получено сообщение:', event.data);
  });
  socket.value.addEventListener('close', () => {
    console.log('WebSocket соединение закрыто.');
    isConnected.value = false;
  });
  socket.value.addEventListener('error', (event) => {
    console.error('Ошибка WebSocket:', event);
    isConnected.value = false;
  });
};

const createRoom = async () => {
  try {
    const response = await fetch('http://localhost:8001/create_room');
    const data = await response.json();
    roomId.value = data.room_id;
    roomUrl.value = data.room_url;
    localStorage.setItem('tod_room_id', roomId.value); // Сохранение roomId в localStorage
    todViewLink.value = `http://localhost:8080/tod-view/${roomId.value}`;
    localStorage.setItem('tod_url_view', todViewLink.value);
    window.dispatchEvent(new Event('storage')); // Событие для обновления данных в основном компоненте
    setupSocket(data.room_url);
  } catch (error) {
    console.error('Error creating room:', error);
  }
};

onMounted(() => {
  if (!roomId.value) {
    createRoom();
  } else {
    setupSocket(`ws://localhost:8001/ws/${roomId.value}`);
  }
});

watch(todViewLink, (newValue) => {
  localStorage.setItem('tod_url_view', newValue);
  window.dispatchEvent(new Event('storage'));
});

defineExpose({ sendMessage, sendButton, roomId, roomUrl, todViewLink });
</script>
