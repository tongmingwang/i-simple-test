import ImDesign from 'im-design'
import './assets/main.css'
import 'im-design/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

createApp(App)
  .use(ImDesign, { size: 32, zIndex: 1000 })
  .use(router)
  .use(createPinia())
  .mount('#app')
