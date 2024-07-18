import { createApp } from 'vue'
import App from './App.vue'
import {router} from "./router"
import './assets/style.sass'
import './assets/neonCheckbox.scss'
import store from './components/store'


const app = createApp(App)

app.use(router)
app.use(store)

app.config.globalProperties.$globalState = {
    user: 'John Doe',
    theme: 'light',
  };


app.mount('#app')











