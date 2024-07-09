<template>
  <GameLayout nameGame="5 секунд">
    <br>
    <div class="containerFormCreate">
      <form @submit.prevent="addNewPlayer" class="formCreate">
        <div v-if="hasSavedData" class="div_continue">
          <button @click="continueGame" class="btn-grad">Продовжити стару гру</button>
        </div>

        <div class="containerFormCreate_5sec" v-for="(user, i) in five_second_users" :key="i">
          <div class="formElement_5sec">
            <input class="input_5sec" type="text" @click="onFocus" v-model="user.name">
          </div>
          <div class="gender-selection formElement_5sec">
            <button @click="removeUser(i)" class="delete-button">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>

        <div class="formElement_5sec">
          <label for="gameType">Виберіть тип гри:</label>
          <select id="gameType" v-model="gameType" class="input_5sec">
            <option value="3">Три слова</option>
            <option value="5">П'ять слів</option>
          </select>
        </div>
        
        <button @click="addUser" class="btn-grad">Додати гравця</button>
        <button type="submit" class="btn-grad" v-on:click="startGame">Почати гру</button>
      </form>
    </div>

    <!-- <ShareButton @share="handleShare" /> -->

   
  </GameLayout>
</template>

<script setup>
import GameLayout from '../GameLayout.vue';
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();

const five_second_users = ref([]);
const hasSavedData = ref(false);
const gameType = ref('3'); // Добавляем переменную для хранения выбранного типа игры

onMounted(() => {
  // Проверяем наличие сохраненных данных
  const savedData = JSON.parse(localStorage.getItem('five_second_game_state'));
  if (savedData) {
    hasSavedData.value = true;
    five_second_users.value = savedData.five_second_users;
  } else {
    const savedUsers = JSON.parse(localStorage.getItem('five_second_users'));
    if (savedUsers) {
      five_second_users.value = savedUsers.map(user => ({ ...user, score: user.score || 0 }));
    } else {
      five_second_users.value = [{ name: "Ваше ім'я", score: 0 }];
    }
  }
});

const addUser = () => {
  five_second_users.value.push({ name: "І'мя", score: 0 });
  saveUsers();
};

const removeUser = (index) => {
  five_second_users.value.splice(index, 1);
  saveUsers();
};

const onFocus = (e) => e.target.select();

const saveUsers = () => {
  localStorage.setItem('five_second_users', JSON.stringify(five_second_users.value));
};

const startGame = () => {
  // Генерация уникального ID комнаты
  const roomId = Math.random().toString(36).substr(2, 9);
  // Обнуление очков всех игроков
  five_second_users.value = five_second_users.value.map(user => ({ ...user, score: 0 }));
  // Сохранение типа игры
  localStorage.setItem('five_second_game_type', gameType.value);
  // Очищаем старые данные игры
  localStorage.removeItem('five_second_game_state');
  saveUsers();
  // Передаем выбранный тип игры в параметрах маршрута
  router.push({ name: 'five-second-room', params: { roomId } });
};

const continueGame = () => {
  const savedData = JSON.parse(localStorage.getItem('five_second_game_state'));
  if (savedData) {
    router.push({ name: 'five-second-room', params: { roomId: savedData.roomId } });
  }
};
</script>

<style scoped>
.input_5sec {
  margin-left: 25px;
}

.div_continue {
  width: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  font-size: 18px;
  height: 50px;
  margin-bottom: 60px;
}

.delete-button {
  background-color: transparent;
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
  background-color: #ff3333;
}

.containerFormCreate_5sec {
  width: 450px;
  display: flex;
  color: aliceblue;
  justify-content: center;
  align-self: flex-start;
}

.formElement_5sec {
  width: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  text-align: center;
  align-content: center;
}

.formCreate {
  display: flex;
  flex-direction: column;
}

.gender-selection {
  display: flex;
  align-items: center;
}

#gameType {
  margin-left: 10px;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
</style>
