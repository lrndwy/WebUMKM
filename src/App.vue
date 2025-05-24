<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Check auth status saat app dimuat
onMounted(async () => {
  await authStore.refreshAuth()
})
</script>

<style>
/* Global styles jika diperlukan */
</style>