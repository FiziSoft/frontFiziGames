<template>
  <div v-if="showOverlay" class="overlay">
    <div class="highlight-box" :style="highlightStyle"></div>
  </div>
  <div v-if="showTooltip" class="tooltip-wrapper" :style="tooltipStyle">
    <div :class="['tooltip', position]">
      <h3 class="tooltip-title">{{ title }}</h3>
      <p class="tooltip-description" v-html="description"></p>
      <div class="dots-container">
        <div v-for="(dot, index) in stepsWithClass" :key="index" :class="['dot', dot.class]"></div>
      </div>
      <div class="tooltip-buttons">
        <button @click="prevStep">{{ $t('tour.back') }}</button>
        <button @click="nextStep">{{ $t('tour.next') }}</button>
        <button @click="closeTooltip">{{ $t('tour.finish') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, computed, onMounted } from 'vue';

const props = defineProps({
  steps: Array
});

const showOverlay = ref(false);
const showTooltip = ref(false);
const tooltipStyle = ref({});
const highlightStyle = ref({});
const currentStep = ref(0);

const title = ref('');
const description = ref('');
const position = ref('bottom');

const stepsWithClass = computed(() => {
  return props.steps.map((step, index) => {
    return {
      ...step,
      class: currentStep.value === index ? 'active' : ''
    };
  });
});

const nextStep = () => {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value += 1;
    updateTooltip();
  } else {
    closeTooltip();
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
    updateTooltip();
  }
};

const closeTooltip = () => {
  showOverlay.value = false;
  showTooltip.value = false;
  removeHighlight();
};

const updateTooltip = () => {
  const step = props.steps[currentStep.value];
  title.value = step.title;
  description.value = step.description;
  position.value = step.position || 'bottom';
  const element = document.querySelector(step.element);
  if (element) {
    const rect = element.getBoundingClientRect();
    tooltipStyle.value = calculatePosition(rect, position.value);
    highlightStyle.value = {
      top: `${rect.top + window.scrollY - rect.height * 0.025}px`,
      left: `${rect.left + window.scrollX - rect.width * 0.025}px`,
      width: `${rect.width * 1.05}px`,
      height: `${rect.height * 1.05}px`,
      boxShadow: `0 0 0 2000px rgba(0, 0, 0, 0.5), 0 0 10px 5px rgba(0, 0, 0, 0.3)`,
      borderRadius: '10px', // добавляем скругленные углы
    };
    highlightElement(element);
    scrollToElement(element);
  }
};

const calculatePosition = (rect, position) => {
  const offset = 20; // уменьшенный отступ
  const tooltipHeight = 150; // примерная высота тултипа
  const tooltipWidth = 400; // примерная ширина тултипа

  let top = window.innerHeight / 2 - tooltipHeight / 2;
  let left = window.innerWidth / 2 - tooltipWidth / 2;

  if (rect.top < top + tooltipHeight && rect.bottom > top) {
    if (rect.top > window.innerHeight / 2) {
      top = rect.top - tooltipHeight - offset;
    } else {
      top = rect.bottom + offset;
    }
  }

  return { top: `${top}px`, left: `${left}px` };
};

const highlightElement = (element) => {
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  element.classList.add('highlight');
  showTooltip.value = true;
  showOverlay.value = true;
};

const scrollToElement = (element) => {
  const rect = element.getBoundingClientRect();
  const elementTop = rect.top + window.scrollY;
  window.scrollTo({ top: elementTop - 50, behavior: 'smooth' });
};

const removeHighlight = () => {
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
};

onMounted(() => {
  updateTooltip();
});

watch(currentStep, () => {
  updateTooltip();
});
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.highlight-box {
  position: absolute;
  z-index: 1002;
  pointer-events: none;
}

.tooltip-wrapper {
  position: fixed;
  z-index: 1003;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.tooltip {
  background: white;
  color: black;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.tooltip-title {
  font-size: 1.2em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.dots-container {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 0 5px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.dot.active {
  background-color: #000;
  transform: scale(1.2);
}

.tooltip-description {
  margin-bottom: 1em;
}

.tooltip-buttons {
  display: flex;
  justify-content: space-between;
}

.tooltip-buttons button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.tooltip-buttons button:hover {
  background-color: #2980b9;
}

.arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  z-index: 1003;
}

.arrow.top {
  border-width: 10px 10px 0 10px;
  border-color: white transparent transparent transparent;
  top: 100%; /* смещаем стрелку вниз */
  left: 50%;
  transform: translateX(-50%);
}

.arrow.bottom {
  border-width: 0 10px 10px 10px;
  border-color: transparent transparent white transparent;
  bottom: 100%; /* смещаем стрелку вверх */
  left: 50%;
  transform: translateX(-50%);
}

.arrow.left {
  border-width: 10px 10px 10px 0;
  border-color: transparent white transparent transparent;
  left: 100%; /* смещаем стрелку влево */
  top: 50%;
  transform: translateY(-50%);
}

.arrow.right {
  border-width: 10px 0 10px 10px;
  border-color: transparent transparent transparent white;
  right: 100%; /* смещаем стрелку вправо */
  top: 50%;
  transform: translateY(-50%);
}
</style>
