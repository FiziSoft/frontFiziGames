<style>


.containerFormCreate_tod {
  width: 200px;
  display: flex;
  color:aliceblue;
  justify-content: center;
}
        
</style>





<template>
    <GameLayout nameGame="Правда або Дія">
 
    <div class="containerFormCreate">    
    <form @submit.prevent="addNewPlayer" class="formCreate">

      <div class="containerFormCreate_tod" v-for="(user, i) in users" :key="i">
        

        <div class="formElement_tod">
          <label>{{ users.name }}</label>
          <input type="text" @click="onFocus" v-model="user.name">
        </div>  

        <div></div>
        
        <div class="gender-selection formElement_tod">        
      
        <input type="checkbox" :id="i" v-model="user.isBoy" name="gender" checked>
        <label :for="i" :class="{
          'gender-label': true,
          'male': user.isBoy == true, 
          'female': user.isBoy == false 
        }"></label>

          <button @click="users.splice(i,1)" class="delete-button">
            <i class="fas fa-trash-alt"></i> 
          </button>
       
        </div>



      </div>
      
      
      <button @click="addUser" class="btn-grad"> Додати гравця </button>
      <button type="submit" class="btn-grad" v-on:click="startGame"> Почати гру  </button>


     

    </form>
  </div>

  <ShareButton @share="handleShare" />

     



    </GameLayout>
</template>          


<script setup>
import GameLayout from '../GameLayout.vue';
import  {ref } from 'vue'
import {router} from "../../router.js"
  
import { v4 as uuidv4 } from 'uuid';


import axios from "axios";



import { useI18n } from 'vue-i18n';
import { url_stat } from "@/link";

const { locale } = useI18n();
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;


const playerName = ref(localStorage.getItem('playerName') || '');


const newPhone = ref('')
const users = ref([
  {
  name: 'Хлопчик1',
  isBoy: true
  },
  {
    name: 'Дівчина1',
    isBoy: false
  }
])

try{
const cur_players = JSON.parse(localStorage.players)
users.value = cur_players
}
catch{
 console.log("перший вхід")
}

let player = 
  {
    name: '',
    isBoy: true,

  }

  let countPlayers = 0  
const addUser = () =>{
  if (countPlayers % 2 == 0){
    users.value.push({name: "І'мя", isBoy: true})
    countPlayers = ++countPlayers 
  }
 else{users.value.push({name: "І'мя", isBoy: false})
  countPlayers = ++countPlayers} 
 
}

const onFocus = (e) => e.target.select();



const roomId = uuidv4();


const startGame =() =>{

  localStorage.setItem('tod_users', JSON.stringify(users.value))
  localStorage.players = JSON.stringify(users.value)

  axios.post(url_stat, {
      game_id: 6,
      room_number: roomId,
      creator_name: playerName.value,
      language: locale.value,
      player_count: 0,
      is_local: true,
     
      
    });

  router.push({name: 'TOD_room' })
 console.log(users)
}
  
</script>