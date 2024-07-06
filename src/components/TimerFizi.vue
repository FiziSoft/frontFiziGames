<template>
  <div class="timerContainer">
    <button v-if="!isRunning && !timeUp && !autoStart" @click="startTimer" class="start_button btn-grad">Старт</button>
    <p v-if="!timeUp">{{ formattedTime }}</p>
    <p v-else>Время вышло</p>
   
    <audio ref="audioRef" src="/alarm.mp3"></audio>
  </div>
</template>

<script>
import { ref, computed, onUnmounted, defineComponent, watch, onMounted } from 'vue';

export default defineComponent({
  name: 'TimerFizi',
  props: {
    timeInSeconds: {
      type: Number,
      required: true
    },
    autoStart: {
      type: Boolean,
      default: false
    },
    timerTimeLeftKey: {
      type: String,
      required: true
    },
    timerIsRunningKey: {
      type: String,
      required: true
    },
    lastUpdateTimeKey: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const timeLeft = ref(props.timeInSeconds);
    const intervalId = ref(null);
    const isRunning = ref(false);
    const timeUp = ref(false);
    const audioRef = ref(null);

    const formattedTime = computed(() => {
      const minutes = Math.floor(timeLeft.value / 60);
      const seconds = timeLeft.value % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });

    const clearLocalStorage = () => {
      localStorage.removeItem(props.timerTimeLeftKey);
      localStorage.removeItem(props.timerIsRunningKey);
      localStorage.removeItem(props.lastUpdateTimeKey);
      localStorage.removeItem('spyTimerTimeLeft');
    };

    const tick = () => {
      if (timeLeft.value > 0) {
        timeLeft.value -= 1;
        localStorage.setItem(props.timerTimeLeftKey, timeLeft.value);
        localStorage.setItem(props.lastUpdateTimeKey, Date.now());
      } else {
        clearInterval(intervalId.value);
        isRunning.value = false;
        timeUp.value = true;
        clearLocalStorage();
        if (audioRef.value) {
          audioRef.value.play().catch(error => console.error("Ошибка воспроизведения аудио:", error));
        }
      }
    };

    const startTimer = () => {
      const currentTime = Date.now();
      const lastUpdateTime = localStorage.getItem(props.lastUpdateTimeKey);
      const savedTimeLeft = localStorage.getItem(props.timerTimeLeftKey);
      
      if (lastUpdateTime === null || currentTime - lastUpdateTime > props.timeInSeconds * 1000 || savedTimeLeft === null || savedTimeLeft <= 0) {
        clearLocalStorage();
        timeLeft.value = props.timeInSeconds;
        localStorage.setItem(props.timerTimeLeftKey, timeLeft.value);
        localStorage.setItem(props.lastUpdateTimeKey, currentTime);
      }

      if (!isRunning.value) {
        isRunning.value = true;
        timeUp.value = false;
        localStorage.setItem(props.timerIsRunningKey, 'true');
        intervalId.value = setInterval(tick, 1000);
      }
    };

    const restoreTimer = () => {
      const savedTimeLeft = localStorage.getItem(props.timerTimeLeftKey);
      const lastUpdateTime = localStorage.getItem(props.lastUpdateTimeKey);
      const isTimerRunning = localStorage.getItem(props.timerIsRunningKey);

      if (savedTimeLeft !== null && lastUpdateTime !== null) {
        const timePassed = Math.floor((Date.now() - lastUpdateTime) / 1000);
        if (timePassed >= props.timeInSeconds) {
          timeLeft.value = 0;
          clearLocalStorage();
        } else {
          timeLeft.value = Math.max(0, savedTimeLeft - timePassed);
          if (isTimerRunning) {
            startTimer();
          }
        }
      } else {
        timeLeft.value = props.timeInSeconds;
      }
    };

    watch(() => props.timeInSeconds, (newTime) => {
      if (!isRunning.value) {
        timeLeft.value = newTime;
      }
    });

    onMounted(() => {
      restoreTimer();
      if (props.autoStart) {
        startTimer();
      }
    });

    onUnmounted(() => {
      clearInterval(intervalId.value);
    });

    return {
      formattedTime,
      startTimer,
      isRunning,
      timeUp,
      audioRef
    };
  }
});
</script>

<style scoped>
p {
  font-size: 2rem;
  font-weight: bold;
}

.start_button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: transparent;
  border: 1px solid;
  border-radius: 12px;
  margin-right: 50px;
  margin-top: 0;
}

.timerContainer {
  display: flex;
  margin: 30px;
  justify-content: space-around;
  align-items: center;
}
</style>
