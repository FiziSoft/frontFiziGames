<template>
  <GameLayout nameGame="Правда або Дія">
    <!-- <WebSocketComponent :name="cur_player.name" :body="share_info" :title="cur_title" :roomId="roomId" ref="websocketComponent" /> -->

    <div class="containerFormCreate">
      <div class="formCreate" v-if="choise_div===true">
        <div class="nameCurPlayer">
          <h1>{{ cur_player.name }} {{  }} </h1>
        </div>
        <transition name="fade">
          <button v-if="isVisible('button1')" ref="button1" v-show="truth_div===true" @click="go_truths(), setOnView()" class="btn-grad">Правда</button>
        </transition>
        <transition name="fade">
          <button v-if="isVisible('button2')" ref="button2" v-show="dares_div===true" @click="go_dares(), setOnView()" class="btn-grad">Дія</button>
        </transition>
        <button v-if="showButton3 && isVisible('button3')" @click="startAnimation" class="btn-grad">Випадково</button>
      </div>
      <div class="formCreate" v-if="choise_div===false && truth_div===true">
        <button class="name_button">Правда</button>
        <div class="formElement">
          <h3><span class="bold">{{ cur_player.name }}</span> <hr>{{ cur_truth.question }}</h3>
        </div>
        <button class="btn-grad w50" @click="next_round">OK</button>
        <div>
          <i class="fas fa-sync-alt refresh_button" @click="go_truths()"></i>
        </div>
      </div>
      <div class="formCreate" v-if="choise_div===false && dares_div===true">
        <button class="name_button">Дія</button>
        <div class="formElement">
          <h3><span class="bold">{{ cur_player.name }}</span> <hr>{{ cur_dare.task }}</h3>
        </div>
        <button class="btn-grad w50" @click="next_round">OK</button>
        <TimerFizi :timeInSeconds="5" />
        <div>
          <i class="fas fa-sync-alt refresh_button" @click="go_dares()"></i>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import GameLayout from '../GameLayout.vue';
import TimerFizi from '@/components/TimerFizi.vue';
import WebSocketComponent from '@/components/WebSocketComponent.vue';
import gsap from 'gsap';

// Импортируем JSON файлы
import truthsData from './truths.json';
import daresData from './dares.json';

const button1 = ref(null);
const button2 = ref(null);
const rotationDuration = ref(1.5);
const hiddenButtons = ref([]);
const showButton3 = ref(true);

const isVisible = (button) => !hiddenButtons.value.includes(button);

const resetState = () => {
  hiddenButtons.value = [];
  rotationDuration.value = 2.5;
  showButton3.value = true;
  if (button1.value) {
    gsap.set(button1.value, { rotationZ: 0, scale: 1, opacity: 1 });
    button1.value.style.backgroundPosition = '0% 50%';
  }
  if (button2.value) {
    gsap.set(button2.value, { rotationZ: 0, scale: 1, opacity: 1 });
    button2.value.style.backgroundPosition = '0% 50%';
  }
};

const startAnimation = () => {
  if (button1.value && button2.value) {
    showButton3.value = false;
    const durationPerButton = 0.8;
    const totalCycles = Math.floor(rotationDuration.value / durationPerButton);
    const selectedButton = Math.random() < 0.5 ? 'button1' : 'button2';
    const notSelectedButton = selectedButton === 'button1' ? button2.value : button1.value;
    const selectedButtonRef = selectedButton === 'button1' ? button1.value : button2.value;

    const tl = gsap.timeline({
      onComplete: () => {
        if (selectedButton === 'button1') {
          go_truths();
        } else {
          go_dares();
        }
        hiddenButtons.value = selectedButton === 'button1' ? ['button2', 'button3'] : ['button1', 'button3'];
      }
    });

    for (let i = 0; i < totalCycles; i++) {
      tl.to(button1.value, {
        duration: durationPerButton,
        rotationX: '+=360',
        scale: 1,
        ease: 'linear'
      });
      tl.to(button2.value, {
        duration: durationPerButton,
        rotationX: '+=360',
        scale: 1,
        ease: 'linear'
      }, `-=${durationPerButton / 2}`);
    }

    setTimeout(() => {
      gsap.to(notSelectedButton, {
        duration: rotationDuration.value / 6,
        opacity: 0,
        ease: 'linear'
      });
      gsap.to(tl, {
        timeScale: 0.9,
        duration: rotationDuration.value / 2,
        ease: 'linear'
      });
    }, (rotationDuration.value * 1000) / 2);

    const animateBackground = (element) => {
      gsap.to(element, {
        backgroundPosition: '100% 50%',
        duration: 3,
        ease: 'linear',
        repeat: -1
      });
    };

    animateBackground(button1.value);
    animateBackground(button2.value);

    setTimeout(() => {
      gsap.killTweensOf(button1.value);
      gsap.killTweensOf(button2.value);
      tl.progress(1);
    }, rotationDuration.value * 1000);
  }
};

const cur_players = JSON.parse(localStorage.players);
const share_div = ref(false);
const choise_div = ref(true);
const truth_div = ref(true);
const dares_div = ref(true);
const count_players = ref(0);
const cur_truth = ref('');
const count_truth = ref(0);
const cur_dare = ref('');
const count_dares = ref(0);
const cur_player = ref(cur_players[0]);
const pre_player = ref(cur_players[count_players.value - 1]);
const actual_name = ref('');
const share_info = ref('');
const cur_title = ref('');
const truths = ref(truthsData); // Используем импортированные данные
const dares = ref(daresData);   // Используем импортированные данные
const websocketComponent = ref(null);

const get_cur_players = (index) => {
  cur_player.value = cur_players[index];
};

const next_round = () => {
  get_cur_players(count_players.value);

  if (count_players.value < Object.keys(cur_players).length - 1) {
    count_players.value++;
  } else {
    count_players.value = 0;
  }

  choise_div.value = true;
  truth_div.value = true;
  dares_div.value = true;
  resetState();
};

const triggerSendMessage = () => {
  if (websocketComponent.value) {
    websocketComponent.value.sendMessage();
  }
};

let sendButton = null;

const setOnView = () => {
  sendButton = document.getElementById('sendButton');
  if (sendButton) {
    console.log('Кнопка найдена:', sendButton);
    sendButton.dispatchEvent(new Event('click'));
  } else {
    console.log('Кнопка не найдена');
  }
};

const get_cur_truth = (index) => {
  share_info.value = truths.value[index]?.question || '';
};

const go_truths = () => {
  if (truths.value.length === 0) return;

  // Выбираем случайный вопрос
  count_truth.value = Math.floor(Math.random() * truths.value.length);
  cur_truth.value = truths.value[count_truth.value];

  choise_div.value = false;
  truth_div.value = true;
  dares_div.value = false;

  cur_title.value = 'Правда';
  share_info.value = truths.value[count_truth.value].question;
  setOnView();
};

const go_dares = () => {
  if (dares.value.length === 0) return;

  // Выбираем случайное действие
  count_dares.value = Math.floor(Math.random() * dares.value.length);
  cur_dare.value = dares.value[count_dares.value];

  choise_div.value = false;
  truth_div.value = false;
  dares_div.value = true;

  cur_title.value = 'Дія';
  share_info.value = dares.value[count_dares.value].task;
  setOnView();
};
</script>

<style lang="sass">
.nameCurPlayer
  font-size: 30px
  text-align: center
  padding-bottom: 40px

.fade-enter-active, .fade-leave-active
  transition: opacity 0.5s

.fade-enter-from, .fade-leave-to
  opacity: 0

button.disabled
  cursor: not-allowed
  opacity: 0.5
  background-image: none
  background-color: transparent

.refresh_button
  margin-top: 20px
  font-size: 30px
  margin-right: 150px
</style>
