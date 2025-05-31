<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
</script>

<style>
/* Global styles jika diperlukan */
</style>
