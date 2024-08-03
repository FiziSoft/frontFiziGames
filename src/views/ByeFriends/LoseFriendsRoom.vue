<template>
  <GameLayout name-game="Як втратити друзів">
    <div class="containerFormCreate">
      <div class="formCreate" v-if="question && !tie">
        <div class="card">
          <h2>{{ question }}</h2>
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
        <h2>Победитель</h2>
        <div class="winner" v-if="winner">
          <img :src="winner.player_photo" :alt="winner.player_name" class="winner-avatar">
          <p>{{ winner.player_name }}</p>
          <p>Счет: {{ winner.score }}</p>
          <h4 v-if="unanimous">Единогласно!</h4>
          <h4 v-else>Голоса за:</h4>
          <ul v-if="!unanimous">
            <li v-for="voter in votes" :key="voter.voter_id">{{ voter.voter_name }}</li>
          </ul>
          <h4 v-if="!unanimous">Все голоса:</h4>
          <ul v-if="!unanimous">
            <li v-for="vote in votesAll" :key="vote.voter_id">
              {{ vote.voter_name }} голосовал за {{ vote.voted_for }}
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="tie">
        <h2>Голосование продолжается</h2>
        <div class="card">
          <h2>{{ question }}</h2>
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

    <div v-if="showWinnerModal" class="modal-overlay" @click.self="closeWinnerModal">
      <div class="modal-content">
        <header class="modal-header">
          <h3>Победитель</h3>
          <button class="close-button" @click="closeWinnerModal">&times;</button>
        </header>
        <section class="modal-body">
          <div class="winner" v-if="winner">
            <img :src="winner.player_photo" :alt="winner.player_name" class="winner-avatar">
            <p>{{ winner.player_name }}</p>
            <p>Счет: {{ winner.score }}</p>
            <h4 v-if="unanimous">Единогласно!</h4>
            <h4 v-else>Голоса за:</h4>
            <ul v-if="!unanimous">
              <li v-for="voter in votes" :key="voter.voter_id">{{ voter.voter_name }}</li>
            </ul>
            <h4 v-if="!unanimous">Все голоса:</h4>
            <ul v-if="!unanimous">
              <li v-for="vote in votesAll" :key="vote.voter_id">
                {{ vote.voter_name }} голосовал за {{ vote.voted_for }}
              </li>
            </ul>
          </div>
        </section>
        <footer class="modal-footer">
          <button v-if="winner && winner.player_id === playerId" @click="nextRound" class="btn-grad">Продолжить</button>
        </footer>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ShareButton from '@/components/ShareButton.vue';
import GameLayout from '../GameLayout.vue';

const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.roomId);
let playerId = ref(localStorage.getItem('LoseFriends_playerId'));

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

let ws;

const url_share = `http://localhost:8080/lose-friends/connect/${roomId.value}`;

const connectWebSocket = () => {
  ws = new WebSocket(`ws://localhost:8002/ws/${roomId.value}/${playerId.value}`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data); // Логирование данных для отладки
    if (data.question) {
      question.value = data.question;
      winner.value = null;
      selectedPlayerId.value = null;
      showWinnerModal.value = false;
    }
    if (data.players) {
      players.value = data.players;
    }
    if (data.winner) {
      winner.value = data.winner;
      votes.value = data.votes;
      votesAll.value = data.votes_all;
      unanimous.value = data.unanimous;
      question.value = null;
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
};

const vote = (votedPlayerId) => {
  if (!selectedPlayerId.value) {
    selectedPlayerId.value = votedPlayerId;
    ws.send(JSON.stringify({ action: 'vote', player_id: votedPlayerId }));
  }
};

const closeWinnerModal = () => {
  showWinnerModal.value = false;
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
  max-width: 300px;
  border-radius: 50%;
  transition: transform 0.3s;
}

.winner-avatar:hover {
  transform: scale(1.1);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  color: #000;
}

.modal-header,
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  margin: 20px 0;
}
</style>
