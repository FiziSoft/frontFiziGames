<template>
  <GameLayout :nameGame="$t('games.five_second.name')">
    <br>
    <div class="containerFormCreate">
      <form @submit.prevent="addNewPlayer" class="formCreate">
        <div v-if="hasSavedData" class="div_continue">
          <button @click="continueGame" class="btn-grad">{{ $t('games.five_second.continue_game') }}</button>
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

        <button @click="addUser" class="btn-grad">{{ $t('games.five_second.add_player') }}</button>
        <button  @click="startGame" type="submit" class="btn-grad">{{ $t('games.five_second.start_game') }}</button>
      </form>
    </div>
  </GameLayout>
</template>

<script setup>
import GameLayout from '../GameLayout.vue';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const five_second_users = ref([]);
const hasSavedData = ref(false);
const gameType = ref('3');

onMounted(() => {
  // Устанавливаем язык из маршрута
  if (route.query.locale) {
    locale.value = route.query.locale;
  }

  const savedData = JSON.parse(localStorage.getItem('five_second_game_state'));
  if (savedData) {
    hasSavedData.value = true;
    five_second_users.value = savedData.five_second_users;
  } else {
    const savedUsers = JSON.parse(localStorage.getItem('five_second_users'));
    if (savedUsers) {
      five_second_users.value = savedUsers.map(user => ({ ...user, score: user.score || 0 }));
    } else {
      five_second_users.value = [{ name: t('games.five_second.default_name'), score: 0 }];
    }
  }
});

const addUser = () => {
  five_second_users.value.push({ name: t('games.five_second.default_name'), score: 0 });
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
  const roomId = Math.random().toString(36).substr(2, 9);
  five_second_users.value = five_second_users.value.map(user => ({ ...user, score: 0 }));
  localStorage.setItem('five_second_game_type', gameType.value);
  localStorage.removeItem('five_second_game_state');
  saveUsers();
  router.push({ name: 'five-second-room', params: { roomId }, query: { locale: locale.value } });
};

const continueGame = () => {
  const savedData = JSON.parse(localStorage.getItem('five_second_game_state'));
  if (savedData) {
    router.push({ name: 'five-second-room', params: { roomId: savedData.roomId }, query: { locale: locale.value } });
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
