import {createWebHistory, createRouter} from 'vue-router'
import MainPage from './views/MainPage.vue'
import RspCreateRoom from './views/PRS/RspCreateRoom.vue'
import RspGameRoom from './views/PRS/RspGameRoom.vue'
import RspConnectToRoom from './views/PRS/RspConnectToRoom.vue'
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
import CodenamesCreate from './views/Codenames/CodenamesCreate.vue'
import CodenamesGameBoard from './views/Codenames/CodenamesGameBoard.vue'
import CodenamesPlayerView from './views/Codenames/CodenamesPlayerView.vue'
import SpyNewCreateRoom from './views/SPY/SpyNewCreateRoom.vue'
import SpyNewGameRoom from './views/SPY/SpyNewGameRoom.vue'
import BattleSeeConnect from './views/BattleSee/BattleSeeConnect.vue'
import SpyOfflineRoom from './views/SPY/SpyOfflineRoom.vue'

import BfConnect from './views/ByeFriends/BfConnect.vue'

const routes = [
    {
        path: '/',
        name: "Main",
        component: MainPage
    },

    { path: '/bye-friends', name: 'byefriends', component: BfConnect },

    {
        path: '/rsp-createRoom',
        name: "RspCreateRoom",
        component: RspCreateRoom
    },

    {
        path: '/spy/createRoom',
        name: "spyCreateRoom",
        component: SpyNewCreateRoom
    },
    
    { path: '/spy/offline/:idRoom', name: 'spyOfflineRoom', component: SpyOfflineRoom },

    {
        path: '/rsp-room/:id',
        name: "RspGameRoom",
        component: RspGameRoom
    },

    {
        path: '/spy/room/:id',
        name: 'spyGameRoom',
        component: SpyNewGameRoom,
        props: true // Разрешить передачу параметров как свойства компонента
    },

    {
        path: '/rsp-connect/:id',
        name: "RspConnect",
        component: RspConnectToRoom,
        props: true
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
        path: '/battle-sea',
        name: 'BattleSee',
        component: BattleSeeCreateRoom,
        props: true
    },
    {
        path: '/battle-sea/connect/:roomId',
        name: 'BattleSeeConnect',
        component: BattleSeeConnect,
        props: true
    },
    {
        path: '/battle-sea/:roomId/:playerId',
        name: 'BattleSeeGameRoom',
        component: BattleSee
    }
    ,
    {
        path: '/crud',
        name: 'TruthDareCrud',
        component: TruthDareCrud
    }
    ,
    {
        path: '/five-second',
        name: 'five-second',
        component: FiveSecondCreateRoom,
        props: route => ({ locale: route.query.locale })
    },
    {
        path: '/five-second/:roomId',
        name: 'five-second-room',
        component: FiveSecond,
        props: route => ({ locale: route.query.locale })
    }
    ,
    {
        path: '/codenames',
        name: 'codenames-create',
        component: CodenamesCreate,
        props: route => ({ locale: route.query.locale })
    }
    ,
    {
        path: '/codenames/game-board/:gameId/:playerId', 
        name: 'codenames-gameboard', 
        component: CodenamesGameBoard, 
        props: route => ({ gameId: route.params.gameId, playerId: route.params.playerId, locale: route.query.locale })
    }
    ,
    {
        path: '/codenames/player-view/:gameId',
        name: 'codenames-player-view',
        component: CodenamesPlayerView,
        props: route => ({ gameId: route.params.gameId, playerId: route.params.playerId, locale: route.query.locale })
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})
