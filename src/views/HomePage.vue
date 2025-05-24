<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Selamat Datang
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Aplikasi Vue.js dengan PocketBase Authentication
        </p>
        
        <div class="space-x-4">
          <router-link
            v-if="!authStore.isAuthenticated.value"
            to="/login"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            Masuk
          </router-link>
          
          <router-link
            v-if="!authStore.isAuthenticated.value"
            to="/register"
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            Daftar
          </router-link>
          
          <router-link
            v-if="authStore.isAuthenticated.value"
            to="/dashboard"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useAuthStore } from '../stores/auth'
  
  const authStore = useAuthStore()
  </script>