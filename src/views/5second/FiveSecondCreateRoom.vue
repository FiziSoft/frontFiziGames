<style>

.delete-button {
            background-color: transparent; /* Красный цвет кнопки */
            border: none;
            color: white;
            padding: 10px 15px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
        }

        .delete-button:hover {
            background-color: #ff3333; /* Более темный красный при наведении */
        }
.containerFormCreate_tod {
  width: 450px;
  display: flex;
  color:aliceblue;
}
        
</style>





<template>
    <GameLayout nameGame="Правда або Дія">
    <br>
    <div class="containerFormCreate">    
    <form @submit.prevent="addNewPlayer" class="formCreate">

      <div class="containerFormCreate_tod" v-for="(user, i) in five_second_users" :key="i">
        

        <div class="formElement_tod">
          <label>{{ five_second_users.name }}</label>
          <input type="text" @click="onFocus" v-model="user.name">
        </div>  

        <div></div>
        
        <div class="gender-selection formElement_tod">        
      
        

          <button @click="five_second_users.splice(i,1)" class="delete-button">
            <i class="fas fa-trash-alt"></i> 
          </button>
       
        </div>



      </div>
      
      
      <button @click="addUser" class="btn-grad"> Додати гравця </button>
      <button type="submit" class="btn-grad" v-on:click="startGame"> Почати гру  </button>


     

    </form>
  </div>

  <ShareButton @share="handleShare" />

      <DIV>
        <ul>
          <li v-for="(i, key) in users" :key="key">{{ i.name }} {{ i.isBoy }} {{ key }}</li>
        </ul>
      </DIV>




    </GameLayout>
</template>          


<script setup>
import GameLayout from '../GameLayout.vue';
import {onBeforeMount, ref, reactive} from 'vue'
import {router} from "../../router.js"
  
import { useRoute } from 'vue-router';
 
const newPhone = ref('')
const five_second_users = ref([
  {
  name: "Ваше ім'я",
  
  },
 
])

try{
const cur_players = JSON.parse(localStorage.five_second_users)
five_second_users.value = cur_players
}
catch{
  alert('ddd')
}

let player = 
  {
    name: '',
    
  }

  let countPlayers = 0  
const addUser = () =>{
  if (countPlayers % 2 == 0){
    five_second_users.value.push({name: "І'мя", isBoy: true})
    countPlayers = ++countPlayers 
  }
 else{five_second_users.value.push({name: "І'мя", isBoy: false})
  countPlayers = ++countPlayers} 
 
}

const onFocus = (e) => e.target.select();

const startGame = () => {
  const roomId = Math.random().toString(36).substr(2, 9); // Генерация уникального ID комнаты
  localStorage.setItem('five_second_users', JSON.stringify(five_second_users.value));
  router.push({ name: 'five-second-room', params: { roomId } });
  console.log(five_second_users.value);
};
  
</script>