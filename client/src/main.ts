// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import createPinia
import App from './App.vue'
import router from './router'
import './style.css' // Jika menggunakan Tailwind CSS

const app = createApp(App)
const pinia = createPinia() // Create a Pinia instance

app.use(router)
app.use(pinia) // Use Pinia with the app

app.mount('#app')
