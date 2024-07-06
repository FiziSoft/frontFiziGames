<template>
  <div class="mainFooter">
    <button class="menuFizi" @click="goToHome">FiziGames</button>
    <div class="theme-selector">
      <select @change="changeTheme($event)">
        <option value="default" style="background: #6a11cb;"></option>
        <option value="theme1" style="background: #ff7e5f;"></option>
        <option value="theme2" style="background: #9733ee;"></option>
        <option value="theme3" style="background: #f9f9a1;"></option>
        <option value="theme4" style="background: #f8c4d4;"></option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentTheme = ref('default')

const themes = {
  default: {
    '--bg-color': 'linear-gradient(90deg, rgba(65,41,90,1) 0%, rgba(47,7,67,1) 100%)',
    '--text-color': '#fff',
    '--gradient-color': 'linear-gradient(to right, #DA22FF 0%, #9733EE 51%, #DA22FF 100%)',
    '--btn-gradient-color': 'linear-gradient(to right, #DA22FF, #9733EE)',
    '--btn-delete-color': '#fff',
    '--fizi-gradient': 'linear-gradient(to right, #FF512F, #DD2476)',
    '--border-color': '#ddd'
  },
  theme1: {
    '--bg-color': '#ff7e5f',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #ff7e5f, #ffb27d)',
    '--btn-gradient-color': 'linear-gradient(to right, #ff4e50, #f9d423)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #6A82FB, #FC5C7D)',
    '--border-color': '#000'
  },
  theme2: {
    '--bg-color': '#9733ee',
    '--text-color': '#fff',
    '--gradient-color': 'linear-gradient(to right, #9733ee, #da22ff)',
    '--btn-gradient-color': 'linear-gradient(to right, #6a11cb, #2575fc)',
    '--btn-delete-color': '#fff',
    '--fizi-gradient': 'linear-gradient(to right, #FF5F6D, #FFC371)',
    '--border-color': '#ddd'
  },
  theme3: {
    '--bg-color': '#f9f9a1',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #f9f9a1, #fce16b)',
    '--btn-gradient-color': 'linear-gradient(to right, #ffdd00, #fbb034)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #00F260, #0575E6)',
    '--border-color': '#000'
  },
  theme4: {
    '--bg-color': '#f8c4d4',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #f8c4d4, #f7a3b0)',
    '--btn-gradient-color': 'linear-gradient(to right, #ff758c, #ff7eb3)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #8E2DE2, #4A00E0)',
    '--border-color': '#000'
  },
}

const applyTheme = (theme) => {
  const root = document.documentElement
  const themeProperties = themes[theme]
  for (const prop in themeProperties) {
    root.style.setProperty(prop, themeProperties[prop])
  }
  localStorage.setItem('theme', theme)
}

const goToHome = () => {
  router.push('/') // переход на главный экран
}

const changeTheme = (event) => {
  currentTheme.value = event.target.value
  applyTheme(currentTheme.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'default'
  currentTheme.value = savedTheme
  applyTheme(savedTheme)
})
</script>

<style lang="sass">
.mainFooter
  display: flex
  justify-content: space-between
  align-items: center
  width: 100%
  padding: 30px
  height: 50px
  background: var(--bg-color)
  position: sticky
  bottom: 0
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1) // Добавляем тень
  border-top: 1px solid rgba(0, 0, 0, 0.1) // Добавляем верхнюю границу


.menuFizi
  background: none
  border: none
  font-size: 16px
  cursor: pointer
  padding: 10px 20px
  border-radius: 5px
  text-transform: uppercase
  background-clip: text
  -webkit-background-clip: text
  color: transparent
  background-image: var(--fizi-gradient)

.theme-selector select
  padding: 5px
  border-radius: 5px
  border: 1px solid var(--text-color)
  background: transparent
  color: var(--text-color)
  font-size: 16px
  cursor: pointer
  width: 70px
</style>
