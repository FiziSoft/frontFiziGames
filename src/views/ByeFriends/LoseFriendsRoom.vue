<template>
  <GameLayout name-game="Як втратити друзів">
    <div class="containerFormCreate">
      <div class="formCreate" v-if="question && !tie && players.length >= 3">
        <div class="card">
          <span>{{ question }}</span>
        </div>
        <div class="players-container">
          <div
            v-for="player in players"
            :key="player.player_id"
            :class="['player', { selected: player.player_id === selectedPlayerId }]"
            @click="vote(player.player_id)"
          >
            <img :src="player.player_photo" :alt="player.player_name" class="player-avatar">
            <p>{{ player.player_name }}</p>
            <div class="score">
              <p>{{ player.score }}</p>
            </div>
            <div class="status-dot" :class="{ active: player.has_voted }"></div>

          </div>
        </div>
      </div>
      <div v-else-if="winner">
        <div class="winner formCreate" v-if="winner">
          <div class="win_text card">
            <span>{{ bbb }}</span>
            <hr>
            <div>{{ unanimous ? "Единогласно! это:" : ""}} <div class="win_name">{{ winner.player_name }}</div></div>
          </div>
          <img :src="winner.player_photo" :alt="winner.player_name" class="winner-avatar">
          <table v-if="!unanimous" class="votes-table">
            <thead>
              <tr>
                <th>Кто</th>
                <th>За кого</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vote in votesAll" :key="vote.voter_id">
                <td :class="{ bold: vote.voted_for === playerName }">{{ vote.voter_name }}</td>
                <td>{{ vote.voted_for === playerName ? 'Вас' : vote.voted_for }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button v-if="winner && winner.player_id === playerId" @click="nextRound" class="btn-grad">Продолжить</button>
      </div>
      <div v-else-if="tie">
       
        <div class="card">
          <span>{{ question }}</span>
        </div>
        <h2>Переголосовоние между:</h2>
        <br>
        <div class="players-container">
          <div
            v-for="player in tiePlayers"
            :key="player.player_id"
            :class="['player', { selected: player.player_id === selectedPlayerId }]"
            @click="vote(player.player_id)"
          >
            <img :src="player.player_photo" :alt="player.player_name" class="player-avatar">
            <p>{{ player.player_name }}</p>
            <div class="score">
              <p>{{ player.score }}</p>
            </div>

          </div>
        </div>
      </div>
      <div v-else>
        <h2>Ожидание подключения игроков...</h2>
        <TelegramShareButton :url="url_share" text="Заходи не бойся, выходи не плач"></TelegramShareButton>
        <div class="players-container">
          <div v-for="player in players" :key="player.player_id" class="player">
            <img :src="player.player_photo" :alt="player.player_name" class="player-avatar">
            <p>{{ player.player_name }}</p>
            <div class="score">
              <p>{{ player.score }}</p>
            </div>
            <div class="status-dot" :class="{ active: player.has_voted }"></div>

          </div>
        </div>
      </div>
      <div class="share">
        <ShareButton :url="url_share"></ShareButton> 
        <div style="font-size: small; padding-left: 10px;"> &#8592; Додай ще майбутніх колишніх друзів </div>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ShareButton from '@/components/ShareButton.vue';
import TelegramShareButton from '@/components/TelegramShareButton.vue';
import GameLayout from '../GameLayout.vue';

import { url_serv_lose_friends_wss, url_serv_lose_friends, url_main_page } from "@/link";

const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.roomId || localStorage.getItem('LoseFriends_roomId'));
let playerId = ref(localStorage.getItem('LoseFriends_playerId'));
let playerName = ref(localStorage.getItem('playerName'));
let playerScore = ref(parseInt(localStorage.getItem('LoseFriends_score') || '0'));

const question = ref(null);
const players = ref([]);
const winner = ref(null);
const selectedPlayerId = ref(null);
const showWinnerModal = ref(false);
const votes = ref([]);
const votesAll = ref([]);
const unanimous = ref(false);
const tie = ref(false);
const tiePlayers = ref([]);

const url_share = `${url_main_page}/lose-friends/connect/${roomId.value}`;

const storedQuestion = computed(() => localStorage.getItem('LoseFriends_cur_q'));
const aaa = computed(() => question.value || storedQuestion.value);
const bbb = ref('');

let ws;

import ReconnectingWebSocket from 'reconnecting-websocket';

const connectWebSocket = () => {
  const wsUrl = `${url_serv_lose_friends_wss}/ws/${roomId.value}/${playerId.value}`;
  ws = new ReconnectingWebSocket(wsUrl, [], {
    maxRetries: 3, // Максимальное количество попыток переподключения
    minReconnectionDelay: 2000, // Минимальная задержка перед переподключением (1 секунда)
  });

  ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received data:', data);

  if (data.type === 'update_players') {
    updatePlayers(data.players);

    if (players.value.length >= 3 && !question.value) {
      askQuestion();
    }
  }

  if (data.type === 'waiting') {
    resetGame();
  }

  if (data.type === 'new_question') {
    updatePlayers(data.players);

    handleNewQuestion(data);
  }

  if (data.type === 'winner_announced') {
    handleWinner(data);
  }

  if (data.type === 'tie') {

      console.log('Handling tie:', data);
      handleTie(data); // Обработка переголосования
  }

  if (data.type === 'end_tie') {
      console.log('End of tie:', data);
      handleEndTie();
  }
};


  ws.onclose = () => {
    console.log("WebSocket connection closed");
    setTimeout(() => {
      connectWebSocket();
    }, 1000);
  };
};

const updatePlayers = (newPlayers) => {
  // Обновляем существующих игроков или удаляем тех, кто отсутствует в новом списке
  players.value = players.value.filter(existingPlayer => {
    const updatedPlayer = newPlayers.find(p => p.player_id === existingPlayer.player_id);
    if (updatedPlayer) {
      Object.assign(existingPlayer, updatedPlayer);
      return true; // Оставляем игрока в списке
    }
    return false; // Удаляем игрока из списка, если его нет в новом списке
  });

  // Добавляем новых игроков, если они не были найдены в текущем списке
  newPlayers.forEach((updatedPlayer) => {
    const existingPlayer = players.value.find(p => p.player_id === updatedPlayer.player_id);
    if (!existingPlayer) {
      players.value.push(updatedPlayer);
    }
  });
};


const resetGame = () => {
  question.value = null;
  winner.value = null;
  selectedPlayerId.value = null;
  showWinnerModal.value = false;
  players.value.forEach(player => player.has_voted = false);
  tie.value = false;
  tiePlayers.value = [];
  localStorage.removeItem('LoseFriends_cur_q');
};

const handleNewQuestion = (data) => {
    tie.value = false; // Сброс состояния переголосования
    tiePlayers.value = []; // Очистка списка игроков для переголосования
    question.value = data.question;
    winner.value = null;
    selectedPlayerId.value = null;
    showWinnerModal.value = false;

    // Сохраняем вопрос в localStorage
    localStorage.setItem('LoseFriends_cur_q', question.value);
    players.value.forEach(player => {
        player.has_voted = false;
        if (player.selected) {
            player.selected = false;
        }
    });

    console.log('New question received and state reset:', {
        question: question.value,
        players: players.value,
        tie: tie.value,
        tiePlayers: tiePlayers.value
    });
};


const handleWinner = (data) => {
  winner.value = data.winner;
  votes.value = data.votes;
  votesAll.value = data.votes_all;
  unanimous.value = data.unanimous;
  question.value = data.cur_question;
  tacke_q();

  selectedPlayerId.value = null;
  showWinnerModal.value = true;
  playerScore.value = winner.value.score;
  localStorage.setItem('LoseFriends_score', playerScore.value);
};

const handleTie = (data) => {
    tie.value = true;
    question.value = data.question;
    tiePlayers.value = data.tiePlayers;
    winner.value = null;
    selectedPlayerId.value = null;
    showWinnerModal.value = false;

    console.log('Tie state updated:', tie.value, tiePlayers.value);
};


const handleEndTie = () => {
  tie.value = false;
  tiePlayers.value = [];
  winner.value = null;
  selectedPlayerId.value = null;
  showWinnerModal.value = false;
  localStorage.removeItem('LoseFriends_cur_q');
  question.value = null;
};

const askQuestion = () => {
  if (players.value.length >= 3) {
    ws.send(JSON.stringify({ action: 'next_round' }));
  }
};

const tacke_q = () => {
  bbb.value = localStorage.getItem('LoseFriends_cur_q');
};

const vote = (votedPlayerId) => {
  if (!selectedPlayerId.value) {
    selectedPlayerId.value = votedPlayerId;

    const currentPlayer = players.value.find(player => player.player_id === playerId.value);
    if (currentPlayer) {
      currentPlayer.has_voted = true;
    }

    ws.send(JSON.stringify({ action: 'vote', player_id: votedPlayerId }));
  }
};

const nextRound = () => {
  handleEndTie(); // Сброс состояния переголосования перед началом нового раунда
  ws.send(JSON.stringify({ action: 'next_round' }));
};

const createAndJoinRoom = async () => {
  console.log('Player ID:', playerId.value);
  console.log('Room ID:', roomId.value);
  playerScore.value = 0;

  const formData = new URLSearchParams();
  formData.append('room_id', roomId.value);
  formData.append('player_id', playerId.value);
  formData.append('player_name', playerName.value);
  formData.append('player_photo', localStorage.getItem('LoseFriends_cartoonPhoto'));
  formData.append('player_score', playerScore.value.toString());

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

  localStorage.setItem('LoseFriends_score', playerScore.value);
  localStorage.setItem('LoseFriends_roomId', roomId.value);
  router.push({ name: 'LoseFriendsGameRoom', params: { roomId: roomId.value } });
};

const joinExistingRoom = async () => {
  console.log('Player ID:', playerId.value);
  console.log('Room ID:', roomId.value);

  const storedRoomId = localStorage.getItem('LoseFriends_roomId');
  if (storedRoomId !== roomId.value) {
    playerScore.value = 0;
  }

  const formData = new URLSearchParams();
  formData.append('room_id', roomId.value);
  formData.append('player_id', playerId.value);
  formData.append('player_name', playerName.value);
  formData.append('player_photo', localStorage.getItem('LoseFriends_cartoonPhoto'));
  formData.append('player_score', playerScore.value.toString());

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

  playerScore.value = responseData.player_score || 0;
  localStorage.setItem('LoseFriends_score', playerScore.value);

  localStorage.setItem('LoseFriends_roomId', roomId.value);
  connectWebSocket();
  question.value = storedQuestion.value;
};

watch([question, players, winner], () => {
  console.log('Состояние изменилось:', {
    question: question.value,
    players: players.value,
    winner: winner.value
  });
});

onMounted(() => {
  if (storedQuestion.value) {
    question.value = storedQuestion.value;
  }

  if (!playerId.value || playerId.value === "undefined" || playerId.value === null || playerId.value.trim() === "" ||
      !roomId.value || roomId.value === "undefined" || roomId.value === null || roomId.value.trim() === "") {
    router.push({ name: 'Home' }).catch(err => {
      console.error('Redirect error:', err);
    });
  } else {
    joinExistingRoom();
  }
});
</script>





<style>
.game-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.players-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.player.selected {
  border: 3px solid #000;
  transform: scale(1.1);
}

.player:hover:not(.selected) {
  transform: scale(1.05);
}

.player-avatar {
  max-width: 100px;
  border-radius: 50%;
}

.winner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.winner-avatar {
  max-width: 200px;
  border-radius: 50%;
  transition: transform 0.5s;
  border: 1px solid;
}

.winner-avatar:hover {
  transform: scale(1.1);
}

.win_text {
  font-size: larger;
}

.win_name {
  border: 1px solid;
  border-radius: 50%;
  padding: 15px;
  margin-top: 15px;
}

.score {
  border: 1px solid;
  border-radius: 50%;
  padding: 5px;
  margin-top: 5px;
  width: 37px;
  height: auto;
  text-align: center;
}

.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: x-large;
  width: 80%;
  max-width: 450px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #000 !important;
}

.share {
  padding: 15px;
  margin-top: 40px;
  display: flex;
  align-items: center;
}

.bold {
  font-weight: bold;
}

.votes-table {
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
}

.votes-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.votes-table th {
  color: #000 !important;
  text-align: center;
}

.votes-table th {
  background-color: #f2f2f2;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgb(187, 185, 185);
  margin-top: 5px;
}

.status-dot.active {
  background-color: green;
}

</style>