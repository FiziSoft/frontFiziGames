<template>
  <div class="chaotic-background">
    <svg class="svg-container" xmlns="http://www.w3.org/2000/svg">
      <image
        v-for="(item, index) in images"
        :key="index"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :href="item.href"
        :style="{ transform: `translate(${item.currentX}px, ${item.currentY}px) rotate(${item.rotation}deg)`, transition: `transform ${item.rotationSpeed}s ease-out` }"
        class="moving-image"
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
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const randomRotationSpeed = Math.random() * 20 + 10; // случайная скорость вращения от 10 до 30 секунд

    images.value.push({
      x: `${randomX}%`,
      y: `${randomY}%`,
      currentX: 0,
      currentY: 0,
      rotation: 0,
      rotationSpeed: randomRotationSpeed,
      width: randomSize,
      height: randomSize,
      href: props.imagePaths[Math.floor(Math.random() * props.imagePaths.length)],
    });
  }
};

const moveImages = () => {
  images.value.forEach((image) => {
    const deltaX = Math.random() * 200 - 100; // движение влево или вправо на случайное количество пикселей
    const deltaY = Math.random() * 200 - 100; // движение вверх или вниз на случайное количество пикселей
    const deltaRotation = Math.random() * 20 - 10; // вращение на случайное количество градусов

    image.currentX += deltaX;
    image.currentY += deltaY;
    image.rotation += deltaRotation;

    // Убедимся, что изображение не выходит за границы экрана
    image.currentX = Math.max(-100, Math.min(100, image.currentX));
    image.currentY = Math.max(-100, Math.min(100, image.currentY));
  });
};

onMounted(() => {
  generateRandomImages();
  setInterval(moveImages, 1000); // обновляем позиции изображений каждые 1000 мс
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
  z-index: 0;
}

.svg-container {
  width: 100%;
  height: 100%;
}

.moving-image {
  position: absolute;
}
</style>
