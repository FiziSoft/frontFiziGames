import { createApp } from 'vue'
import App from './App.vue'
import {router} from "./router"
import './assets/style.sass'
import './assets/neonCheckbox.scss'
import './assets/loader.css'
import store from './components/store'
import i18n from './i18n'

const app = createApp(App)

app.use(router)
app.use(store)

app.use(i18n);


app.mount('#app')











