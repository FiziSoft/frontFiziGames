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
import {onBeforeMount, ref, reactive} from 'vue'
import {router} from "../../router.js"
  
import { useRoute } from 'vue-router';
 
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

const startGame =() =>{

  localStorage.setItem('users', JSON.stringify(users.value))
  localStorage.players = JSON.stringify(users.value)
  router.push({name: 'TOD_room' })
 console.log(users)
}
  
</script>