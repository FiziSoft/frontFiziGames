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




if ('serviceWorker' in navigator && 'indexedDB' in window) {
    // Инициализация сервис-воркера и IndexedDB
    navigator.serviceWorker.register('/service-worker.js').then(() => {
        alert('Service Worker зарегистрирован');
    }).catch(error => {
        console.error('Ошибка при регистрации Service Worker:', error);
    });
} else {
    alert('Ваш браузер не поддерживает офлайн-режим');
}







