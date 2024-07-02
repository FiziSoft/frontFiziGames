import {createWebHistory, createRouter} from 'vue-router'
import MainPage from './views/MainPage.vue'
import CreateRoom from './views/PRS/CreateRoom.vue'
import GameRoom from './views/PRS/GameRoom.vue'
import ConnectToRoom from './views/PRS/ConnectToRoom.vue'
import GameLayout from './views/GameLayout.vue'
import spyCreateRoom from './views/SPY/SpyCreateRoom.vue'
import spyGameRoom from './views/SPY/SpyGameRoom.vue'
import spyConnectToRoom from './views/SPY/SpyConnectToRoom.vue'
import TodCreateRoom from './views/TOD/TodCreateRoom.vue'
import TodGameRoom from './views/TOD/TodGameRoom.vue'
import DataView from './components/DataView.vue'
import BattleSee from './views/BattleSee/BattleSee'
import BattleSeeCreateRoom from './views/BattleSee/BattleSeeCreateRoom'
import TruthDareCrud from './views/TOD/TruthDareCrud'
import FiveSecond from './views/5second/FiveSecond.vue'
import FiveSecondCreateRoom from './views/5second/FiveSecondCreateRoom.vue'

const routes = [
    {
        path: '/',
        name: "Main",
        component: MainPage
    },

    {
        path: '/CreateRoom',
        name: "CreateRoom",
        component: CreateRoom
    },

    {
        path: '/spy/CreateRoom',
        name: "spyCreateRoom",
        component: spyCreateRoom
    },

    {
        path: '/room/:id',
        name: "GameRoom",
        component: GameRoom
    },

    {
        path: '/spy/room/:id',
        name: 'spyGameRoom',
        component: spyGameRoom,
        props: true // Разрешить передачу параметров как свойства компонента
    },

    {
        path: '/connect/:id',
        name: "Connect",
        component: ConnectToRoom
    },

    {
        path: '/spy/connect/:id',
        name: "Connect",
        component: spyConnectToRoom
    },

    {
        path: '/tod',
        name: "TOD",
        component: TodCreateRoom
    },

    {
        path: '/tod/room',
        name: "TOD_room",
        component: TodGameRoom
    },
    {
        path: '/tod-view/:roomId',
        name: 'DataView',
        component: DataView,
        props: true
    }
    ,
    {
        path: '/battle-see',
        name: 'BattleSee',
        component: BattleSeeCreateRoom,
        props: true
    },
    {
        path: '/battle-see/:roomId/:playerId',
        name: 'BattleSeeGameRoom',
        component: BattleSee,
    }
    ,
    {
        path: '/crud',
        name: 'TruthDareCrud',
        component: TruthDareCrud,
    }
    ,
    {
        path: '/five-second',
        name: 'five-second',
        component: FiveSecondCreateRoom,
    },
    {
        path: '/five-second/:roomId',
        name: 'five-second-room',
        component: FiveSecond,
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})