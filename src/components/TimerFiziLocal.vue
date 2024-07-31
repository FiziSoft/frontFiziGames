<template>
    <div class="timer">
      <span>{{ formattedTime }}</span>
    </div>
  </template>
  
  <script>
  export default {
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
      formattedTime() {
        const minutes = String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
        const seconds = String(Math.floor(this.timeLeft % 60)).padStart(2, '0');
        return `${minutes}:${seconds}`;
      }
    },
    methods: {
      startTimer() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft -= 1;
          } else {
            clearInterval(this.intervalId);
            this.$emit('time-up');
          }
        }, 1000);
      },
      stopTimer() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      },
      setTimeLeft(seconds) {
        this.timeLeft = seconds;
      }
    },
    mounted() {
      if (this.autoStart) {
        this.startTimer();
      }
    },
    beforeUnmount() {
      this.stopTimer();
    },
    watch: {
      timeLeft(newValue) {
        localStorage.setItem('remainingTime', newValue);
      }
    }
  };
  </script>
  
  <style scoped>
  .timer {
    font-size: 2em;
    text-align: center;
  }
  </style>
  