<template>
    <div class="mainContainer">
      <div class="mainHeader">
        <div class="game_name">{{ nameGame }}</div>
      </div>
      <div class="mainBody">
        <slot></slot>
      </div>
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
    margin: 0
    padding: 0
  
  .mainHeader
    width: 100%
    display: flex
    justify-content: center
    text-align: center
    font-size: 40px
    font-weight: 100
    // height: 90px
    padding: 10px
  
  .mainBody
    margin: 10px
    width: 100%
    flex: 1

  
@media (max-width: 768px)
  .game_name 
    font-size: 1em
    

  
@media (max-width: 480px)
.game_name 
    font-size: 0.7em
    
  </style>
  