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
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { io } from 'socket.io-client';
  import ShareButton from '@/components/ShareButton.vue';
  import TelegramShareButton from '@/components/TelegramShareButton.vue';
  import GameLayout from '../GameLayout.vue';
  
  import { url_serv_lose_friends_share, url_serv_lose_friends } from "@/link"
  
  const route = useRoute();
  const router = useRouter();
  const roomId = ref(route.params.roomId || localStorage.getItem('LoseFriends_roomId'));
  let playerId = ref(localStorage.getItem('LoseFriends_playerId'));
  let playerName = ref(localStorage.getItem('playerName'));
  let playerScore = ref(parseInt(localStorage.getItem('LoseFriends_score') || '0'));
  
  const question = ref(null);
  let players = ref([]);
  const winner = ref(null);
  const selectedPlayerId = ref(null);
  const showWinnerModal = ref(false);
  const votes = ref([]);
  const votesAll = ref([]);
  const unanimous = ref(false);
  const tie = ref(false);
  const tiePlayers = ref([]);
  
  const url_share = `${url_serv_lose_friends_share}/lose-friends/connect/${roomId.value}`;
  
  const storedQuestion = computed(() => localStorage.getItem('LoseFriends_cur_q'));
  const aaa = computed(() => question.value || storedQuestion.value);
  const bbb = ref('');
  
  let socket;
  
  
  socket = io('http://localhost:8087', {
      transports: ["websocket", "polling"],
    
      withCredentials: true
    });
  
    
  socket.emit('join', {
        roomId: roomId.value,
        playerId: playerId.value,
        playerName: playerName.value,
        playerPhoto: localStorage.getItem('LoseFriends_cartoonPhoto'),
        playerScore: playerScore.value
    });
      
   
  
  socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  
  socket.on('players', (data)  => {
      
      console.log("Received players event");
      console.log('Received update_players:', data);
      players.value = data.players;
      console.log('Updated players:', players.value);
    });
  
  socket.on('player_connected', (data) => {
      console.log('Player connected:', data);
    });
  
  socket.on('player_disconnected', (data) => {
      console.log(data.message);
      console.log('Player disconnected:', data);
    });
  
  socket.on('new_question', (data) => {
      console.log('Received new_question:', data);
      question.value = data.question;
      winner.value = null;
      selectedPlayerId.value = null;
      showWinnerModal.value = false;
      localStorage.setItem('LoseFriends_cur_q', question.value);
    });
  
  socket.on('winner', (data) => {
      console.log('Received winner:', data);
      winner.value = data.winner;
      votes.value = data.votes;
      votesAll.value = data.votes_all;
      unanimous.value = data.unanimous;
      question.value = data.cur_question; // Обновление вопроса
      tacke_q();
  
      selectedPlayerId.value = null;
      showWinnerModal.value = true;
      playerScore.value = winner.value.score;
      localStorage.setItem('LoseFriends_score', playerScore.value);
    });
  
  socket.on('tie', (data) => {
      console.log('Received tie:', data);
      console.log('tiePlayers:', data.tiePlayers);
      tie.value = true;
      question.value = data.question;
      tiePlayers.value = data.tiePlayers;
      winner.value = null;
      selectedPlayerId.value = null;
      showWinnerModal.value = false;
    });
  
  socket.on('join_room', (data) => {
      console.log('Received join_room:', data);
      playerScore.value = data.player_score;
      localStorage.setItem('LoseFriends_score', playerScore.value);
    });
  
  
  const askQuestion = () => {
    if (players.value && players.value.length >= 3) {
      socket.emit('next_round', { roomId: roomId.value });
    }
  };
  
  const tacke_q = () => {
    bbb.value = localStorage.getItem('LoseFriends_cur_q');
  };
  
  const vote = (votedPlayerId) => {
      if (!selectedPlayerId.value) {
          selectedPlayerId.value = votedPlayerId;
          console.log(`Player ${playerId.value} voted for ${votedPlayerId}`);
          socket.emit('vote', { 
              room_id: roomId.value, 
              voter_id: playerId.value, 
              voted_player_id: votedPlayerId 
          });
      }
  };
  
  const nextRound = () => {
    showWinnerModal.value = false;
    socket.emit('next_round', { roomId: roomId.value });
  };
  
  const createAndJoinRoom = async () => {
    console.log('Player ID:', playerId.value);
    console.log('Room ID:', roomId.value);
    playerScore.value = 0;  // Обнуляем очки игрока при создании новой комнаты
    console.log('Player Score:', playerScore.value);
  
    const formData = new URLSearchParams();
    formData.append('room_id', roomId.value);
    formData.append('player_id', playerId.value);
    formData.append('player_name', playerName.value);
    formData.append('player_photo', localStorage.getItem('LoseFriends_cartoonPhoto'));
    formData.append('player_score', playerScore.value.toString());
  
    try {
      const joinResponse = await fetch(`${url_serv_lose_friends}/join_room`, {
        method: 'POST',
        body: formData
      });
  
      if (!joinResponse.ok) {
        const responseData = await joinResponse.json();
        console.error('Error joining room:', responseData);
        return;
      }
  
      const responseData = await joinResponse.json();
      console.log('Join response:', responseData);
  
      localStorage.setItem('LoseFriends_score', playerScore.value);  // Сохраняем обнуленные очки в локальное хранилище
      localStorage.setItem('LoseFriends_roomId', roomId.value); // Сохраняем текущий roomId
      router.push({ name: 'LoseFriendsGameRoom', params: { roomId: roomId.value } });
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };
  
  const joinExistingRoom = async () => {
    console.log('Player ID:', playerId.value);
    console.log('Room ID:', roomId.value);
  
    const storedRoomId = localStorage.getItem('LoseFriends_roomId');
    if (storedRoomId !== roomId.value) {
      playerScore.value = 0;
    }
    console.log('Player Score:', playerScore.value);
  
    const formData = new URLSearchParams();
    formData.append('room_id', roomId.value);
    formData.append('player_id', playerId.value);
    formData.append('player_name', playerName.value);
    formData.append('player_photo', localStorage.getItem('LoseFriends_cartoonPhoto'));
    formData.append('player_score', playerScore.value.toString());
  
    try {
      const joinResponse = await fetch(`${url_serv_lose_friends}/join_room`, {
        method: 'POST',
        body: formData
      });
  
      if (!joinResponse.ok) {
        const responseData = await joinResponse.json();
        console.error('Error joining room:', responseData);
        return;
      }
  
      const responseData = await joinResponse.json();
      console.log('Join response:', responseData);
  
      // players.value = responseData.players.players
  
      playerScore.value = responseData.player_score || 0;
      localStorage.setItem('LoseFriends_score', playerScore.value);
  
      localStorage.setItem('LoseFriends_roomId', roomId.value);
     
      question.value = storedQuestion.value;
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };
  
  onMounted(() => {
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
  }
  
  .player.selected {
    border: 3px solid #000;
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
    text-align: center;
  }
  
  .card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
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
    text-align: center;
  }
  
  .votes-table th {
    background-color: #f2f2f2;
  }
  </style>
  