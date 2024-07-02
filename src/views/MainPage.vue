<template>

   <div class="mainContainer mainPage">

       <div class="text-gradient">Fizi Games</div> <hr> <br>

      <div>Найкращі настільні ігри Онлайн для компаній</div>
       <div  class="name_game">
          <a :href="network_url+'/CreateRoom'"><h1 class="">
            <i class="fa-solid fa-hands-asl-interpreting"></i>
            <div>Камінь Ножиці Бумага</div></h1></a>
       </div>

       <div  class="name_game">
          <a :href="network_url+'/spy/CreateRoom'"><h1 class="">
            <i class="fa-solid fa-user-secret"></i>
            <div>Шпіон</div></h1></a>
       </div>
   
       <div  class="name_game">
          <a :href="network_url+'/tod' "><h1 class="">
            <i class="fa-solid fa-hat-wizard"></i>
            <div>Правда або Дія</div></h1></a>
       </div>

       <div  class="name_game">
          <a :href="network_url+'/battle-see' "><h1 class="">
            <i class="fa-solid fa-hat-wizard"></i>
            <div>BattleSee</div></h1></a>
       </div>

       <div  class="name_game">
          <a :href="network_url+'/five-second' "><h1 class="">
            <i class="fa-solid fa-hat-wizard"></i>
            <div>5 seond</div></h1></a>
       </div>
   
   
   
   <br>
   
   
   
   
   </div>
   </template>
   
   <script setup>
   import { ref } from 'vue';
   
   let ti_me = Date();
   
   // const network_url = ref('http://192.168.50.58:8080')
   const network_url = 'http://localhost:8080'
   
   
   
   </script>
   <style lang="sass">
   
   .logo_main
      font-size: 79px
      
   
   .name_game
     border: 1px solid
     padding: 20px
     border-radius: 12px 
     margin: 20px
   
   // Переменные для градиента
   // Миксин для градиентного текста
   @mixin gradient-text
     background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7, #5c7cfa, #339af0, #22b8cf, #20c997, #51cf66, #94d82d, #fcc419, #ff922b, #ff6b6b)
     -webkit-background-clip: text
     -webkit-text-fill-color: transparent
     background-clip: text
     text-fill-color: transparent
   
   // Класс для текста с градиентом
   .text-gradient
     @include gradient-text
     font-size: 89px // Пример размера шрифта
     font-weight: 100 // Пример жирности шрифта
      
   
   </style>