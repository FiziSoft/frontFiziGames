<template>
    <div class="mainContainer">
      <div class="mainHeader">
        <div>{{ nameGame }}</div>
      </div>
      <div class="mainBody">
        <slot></slot>
      </div>
      <FooterComponent />
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import FooterComponent from '@/components/FooterComponent.vue'
  
  const props = defineProps({
    nameGame: {
      type: String,
      required: true,
    },
  })
  </script>
  
  <style lang="sass" scoped>
  .mainContainer
    display: flex
    flex-direction: column
    min-height: 100vh
  
  .mainHeader
    width: 100%
    display: flex
    justify-content: center
    text-align: center
    font-size: 40px
    font-weight: 100
    height: 90px
    padding: 10px
  
  .mainBody
    margin: 10px
    width: 100%
    flex: 1
  </style>
  