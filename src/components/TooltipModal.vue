<template>
  <div>
    <span class="info-icon" @click="showTooltip">?</span>
    <div v-if="show" class="tooltip-overlay" @click="hideTooltip">
      <div class="highlighted-element" :style="highlightedStyle">
        <slot></slot>
      </div>
      <div class="tooltip-modal" :style="tooltipStyle">
        <div class="tooltip-content" v-html="text">
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
});

const show = ref(false);
const tooltipStyle = ref({});
const highlightedStyle = ref({});
const formattedText = ref('');

const showTooltip = () => {
  const targetElement = document.getElementById(props.targetId);
  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    tooltipStyle.value = {
      position: 'absolute',
      top: `${rect.top - 22}px`,
      left: `${rect.left - 5}px`,
      maxWidth: '300px',
      backgroundColor: '#fff',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1003,
      transform: 'translateY(-100%)',
    };

    highlightedStyle.value = {
      position: 'absolute',
      top: `${rect.top - 5}px`,
      left: `${rect.left - 5}px`,
      width: `${rect.width + 10}px`,
      height: `${rect.height + 10}px`,
      zIndex: 1003,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      color: 'black',
    };

    // Применяем форматирование для текста
    formattedText.value = props.text;

    show.value = true;
  }
};

const hideTooltip = () => {
  show.value = false;
};

onMounted(() => {
  const targetElement = document.getElementById(props.targetId);
  if (targetElement) {
    targetElement.style.position = 'relative';
  }
});
</script>

<style scoped>
.info-icon {
  font-weight: bold;
  cursor: pointer;
  margin-left: 5px;
  color: #238a59;
  display: inline-block;
  position: relative;
}

.tooltip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 1000;
}

.tooltip-modal {
  position: fixed;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 10px;
  z-index: 1003;
}

.tooltip-arrow {
  position: absolute;
  bottom: -10px;
  left: 30px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #fff;
}

.tooltip-content {
  pointer-events: auto;
  color: black;
  white-space: pre-wrap; /* Обеспечивает перенос строк */
}

.highlighted-element {
  position: absolute;
  z-index: 1003;
}
</style>
