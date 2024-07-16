import { createApp } from 'vue'
import App from './App.vue'
import {router} from "./router"
import './assets/style.sass'
import './assets/neonCheckbox.scss'
import store from './components/store'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000' 

const app = createApp(App)

app.use(router)
app.use(store)


app.mount('#app')











