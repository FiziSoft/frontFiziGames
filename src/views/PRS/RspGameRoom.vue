<script setup>
import { ref, reactive, onMounted, defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import GameLayout from '../GameLayout.vue'
import TelegramShareButton from '@/components/TelegramShareButton.vue'

// const serv_url = "localhost:8000"
const serv_url = "rsp-f1c55df7ba69.herokuapp.com"

const pName = localStorage.getItem('playerName')
const route = useRoute()
const router = useRouter()
let choiceGet = ref(true)
let gameState = ref('WaitPlayers')
const room = reactive({
  name: '',
  players: [],
})

const showChoice = ref(false)
const showResult = ref(false)
const resultMessage = ref('')

const showPopup = () => {
  showChoice.value = true
}

const closePopup = () => {
  showChoice.value = false
  showResult.value = false
}

const qrCodeValue = `https://fizigames-799b6804c93a.herokuapp.com/rsp-connect/${route.params.id}`
const textShare = "Давай грати на FiziGames у Камінь-Ножиці-Бумага"
const userHash = localStorage.getItem('hash')
let websocket

const initializeWebSocket = () => {
  if (userHash) {
    websocket = new WebSocket(`wss://${serv_url}/start/${route.params.id}?name=${pName}&player_hash=${userHash}`)
  } else {
    websocket = new WebSocket(`wss://${serv_url}/start/${route.params.id}?name=${pName}`)
  }

  websocket.onmessage = function (event) {
    const message = JSON.parse(event.data)

    const eventType = message.event
    if (message.hash) {
      localStorage.setItem('hash', message.hash)
    }

    if (eventType === 'GameCanBeStart') {
      gameState.value = 'GameCanBeStart';
      showPopup();
    } else if (['Win', 'Draw', 'Lose'].includes(eventType)) {
      choiceGet.value = false;
      resultMessage.value = eventType === 'Win' ? 'Виграш' : eventType === 'Draw' ? 'Нічия' : 'Програш';
      showResult.value = true;
    } else if (eventType === 'NewPlayerConnected') {
      console.log(`Новий гравець приєднався: ${message.player_name}`)
      Object.assign(room, message['room'])
    }

    Object.assign(room, message['room'])
  }

  websocket.onopen = () => {
    console.log('WebSocket connection established.')
  }

  websocket.onclose = (event) => {
    console.log(`WebSocket connection closed: ${event.code}, ${event.reason}`)
    if (event.code === 1003) {
      setTimeout(() => {
        location.reload()
      }, 2000)
    }
  }

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

const sendPlayerChoiceToServer = (choice) => {
  const data = JSON.stringify({ choice: choice })
  websocket.send(data)
  resultMessage.value = `Ви обрали ${choice}`
  choiceGet.value = false
  showChoice.value = false
}

const playAgain = () => {
  choiceGet.value = true
  showResult.value = false
  gameState.value = 'GameCanBeStart'
  showPopup()
}

onMounted(() => {
  setTimeout(() => {
    initializeWebSocket();
  }, 500);
});
</script>
