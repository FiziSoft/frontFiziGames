<template>
    <div class="chaotic-background">
      <svg class="svg-container" xmlns="http://www.w3.org/2000/svg">
        <image
          v-for="(item, index) in images"
          :key="index"
          :x="item.startX"
          :y="item.startY"
          :width="item.width"
          :height="item.height"
          :href="item.href"
          class="moving-image"
          :style="generateStyle(index)"
        />
      </svg>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, defineProps } from 'vue';
  
  const props = defineProps({
    numberOfImages: {
      type: Number,
      default: 15,
    },
    minSize: {
      type: Number,
      default: 30,
    },
    maxSize: {
      type: Number,
      default: 80,
    },
    minSpeed: {
      type: Number,
      default: 5,
    },
    maxSpeed: {
      type: Number,
      default: 15,
    },
    imagePaths: {
      type: Array,
      default: () => [
        require('../assets/teddy.png'),
        // добавьте другие пути
      ],
    },
  });
  
  const images = ref([]);
  
  const generateRandomImages = () => {
    images.value = [];
    for (let i = 0; i < props.numberOfImages; i++) {
      const randomSize = Math.random() * (props.maxSize - props.minSize) + props.minSize;
      const startX = Math.random() * 80;
      const startY = Math.random() * 80;
  
      images.value.push({
        startX: `${startX}%`,
        startY: `${startY}%`,
        width: randomSize,
        height: randomSize,
        href: props.imagePaths[Math.floor(Math.random() * props.imagePaths.length)],
        speedX: Math.random() * (props.maxSpeed - props.minSpeed) + props.minSpeed,
        speedY: Math.random() * (props.maxSpeed - props.minSpeed) + props.minSpeed,
        rotationSpeed: Math.random() * 5 + 3,
      });
    }
  };
  
  const generateStyle = (index) => {
    const image = images.value[index];
    return {
      animation: `
        moveX ${image.speedX}s infinite alternate ease-in-out,
        moveY ${image.speedY}s infinite alternate ease-in-out,
        rotateImage ${image.rotationSpeed}s infinite linear`
    };
  };
  
  onMounted(() => {
    generateRandomImages();
  });
  </script>
  
  <style scoped>
  .chaotic-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 99999;
  }
  
  .svg-container {
    width: 100%;
    height: 100%;
  }
  
  .moving-image {
    position: absolute;
  }
  
  @keyframes moveX {
    0% { transform: translateX(0); }
    100% { transform: translateX(100px); }
  }
  
  @keyframes moveY {
    0% { transform: translateY(0); }
    100% { transform: translateY(100px); }
  }
  
  @keyframes rotateImage {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  