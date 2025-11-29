import './assets/main.css'

import i18n from '@/locales'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import '@/assets/iconfont/iconfont.css'
import router from '@/router'
import 'tdesign-vue-next/es/style/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(router)

app.mount('#app')
