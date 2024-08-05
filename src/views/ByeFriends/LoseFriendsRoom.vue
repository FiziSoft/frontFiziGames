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
            <p>Очки: {{ player.score }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="winner">
        <div class="winner" v-if="winner">
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
        <h2>Голосование продолжается</h2>
        <div class="card">
          <span>{{ question }}</span>
        </div>
        <div class="players-container">
          <div
            v-for="player in tiePlayers"
            :key="player.player_id"
            :class="['player', { selected: player.player_id === selectedPlayerId }]"
            @click="vote(player.player_id)"
          >
            <img :src="player.player_photo" :alt="player.player_name" class="player-avatar">
            <p>{{ player.player_name }}</p>
            <p>Очки: {{ player.score }}</p>
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
            <p>Очки: {{ player.score }}</p>
          </div>
        </div>
      </div>
      <div class="share">
        <ShareButton :url="url_share"></ShareButton> &#8592;
        <div> Додай ще майбутніх колишніх друзів </div>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ShareButton from '@/components/ShareButton.vue';
import TelegramShareButton from '@/components/TelegramShareButton.vue';
import GameLayout from '../GameLayout.vue';

const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.roomId);
let playerId = ref(localStorage.getItem('LoseFriends_playerId'));
let playerName = ref(localStorage.getItem('playerName'));

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

const url_share = `https://fizi.cc/lose-friends/connect/${roomId.value}`;

const storedQuestion = computed(() => localStorage.getItem('lose_friend_cur_q'));
const aaa = computed(() => question.value || storedQuestion.value);
const bbb = ref('')

let ws;

const connectWebSocket = () => {
  ws = new WebSocket(`wss://lose-friends-b2c531fd41a8.herokuapp.com/ws/${roomId.value}/${playerId.value}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data); // Логирование данных для отладки

    if (data.players) {
      players.value = data.players;
      if (players.value.length >= 3 && !question.value) {
        askQuestion();
      }
    }

    if (data.waiting) {
      question.value = null;
      winner.value = null;
      selectedPlayerId.value = null;
      showWinnerModal.value = false;
    }
    
    if (data.question && players.value.length >= 3) {
      question.value = data.question;
      winner.value = null;
      selectedPlayerId.value = null;
      showWinnerModal.value = false;
      localStorage.setItem('lose_friend_cur_q', question.value);
    }

    if (data.winner) {
      winner.value = data.winner;
      votes.value = data.votes;
      votesAll.value = data.votes_all;
      unanimous.value = data.unanimous;
      question.value = data.cur_question; // Обновление вопроса
      tacke_q()

      selectedPlayerId.value = null;
      showWinnerModal.value = true;
    }

    if (data.tie) {
      tie.value = true;
      question.value = data.question;
      tiePlayers.value = data.tiePlayers;
      winner.value = null;
      selectedPlayerId.value = null;
      showWinnerModal.value = false;
    } else {
      tie.value = false;
      tiePlayers.value = [];
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
    setTimeout(() => {
      connectWebSocket();
    }, 1000);
  };
};

const askQuestion = () => {
  if (players.value.length >= 3) {
    ws.send(JSON.stringify({ action: 'next_round' }));
  }
};

const tacke_q = () => {
  bbb.value = localStorage.getItem('lose_friend_cur_q');
};

const vote = (votedPlayerId) => {
  if (!selectedPlayerId.value) {
    selectedPlayerId.value = votedPlayerId;
    ws.send(JSON.stringify({ action: 'vote', player_id: votedPlayerId }));
  }
};

const nextRound = () => {
  showWinnerModal.value = false;
  ws.send(JSON.stringify({ action: 'next_round' }));
};

onMounted(() => {
  if (!playerId.value || playerId.value === "undefined") {
    router.push({ name: 'Home' });
  } else {
    connectWebSocket();
    question.value = storedQuestion.value;
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
}

.votes-table th {
  background-color: #f2f2f2;
}
</style>
