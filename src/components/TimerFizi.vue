<template>
  <div>{{ formattedTimeLeft }}</div>
</template>

<script>
export default {
  name: 'TimerFizi',
  props: {
    timeInSeconds: {
      type: Number,
      required: true
    },
    autoStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      timeLeft: this.timeInSeconds,
      intervalId: null
    };
  },
  computed: {
    formattedTimeLeft() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = (this.timeLeft % 60).toFixed(0);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  },
  methods: {
    startTimer() {
      if (this.intervalId) return;
      this.intervalId = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }, 1000);
    },
    setTimeLeft(time) {
      this.timeLeft = time;
    },
    resetTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.timeLeft = this.timeInSeconds;
    }
  },
  watch: {
    timeInSeconds(newValue) {
      this.resetTimer();
      this.timeLeft = newValue;
      if (this.autoStart) {
        this.startTimer();
      }
    }
  },
  mounted() {
    if (this.autoStart) {
      this.startTimer();
    }
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
};
</script>
