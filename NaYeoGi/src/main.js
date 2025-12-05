import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 상태 관리 추가
import App from '@/App.vue'
import router from './router'       // 라우터 추가



const app = createApp(App)

app.use(createPinia()) // Pinia 장착
app.use(router)        // Router 장착

app.mount('#app')