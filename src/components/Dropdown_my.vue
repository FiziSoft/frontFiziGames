<template>
  <label class="btn-gradient-1">{{ label }}</label>
  <div class="dropdown">
    <div class="dropdown-selected" @click="toggleDropdown">{{ modelValue || 'зроби вибір' }}</div>
    <ul v-if="isOpen" class="dropdown-list">
      <li
        v-for="(item, index) in items"
        :key="index"
        @click="selectItem(item)"
        class="dropdown-item"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: false,
  },
});

const emits = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectItem = (item) => {
  emits('update:modelValue', item);
  isOpen.value = false;
};
</script>

<style scoped>
.dropdown {
  width: 50%;
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 12px;
  color: black;
  text-align: center;
  z-index: 999;
}

.dropdown-selected {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 40px;
  background-color: #fff;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border: 1px solid #ccc;
  border-radius: 20px;
  background-color: #fff;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dropdown-item {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}


</style>
