<!-- views/auth/RegisterPage.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Buat akun baru
          </h2>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Nama
              </label>
              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nama lengkap"
                :disabled="authStore.isLoading.value"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="email@example.com"
                :disabled="authStore.isLoading.value"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
                :disabled="authStore.isLoading.value"
              />
            </div>

            <div>
              <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <input
                id="passwordConfirm"
                v-model="form.passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Konfirmasi password"
                :disabled="authStore.isLoading.value"
              />
            </div>
          </div>

          <div v-if="authStore.error.value" class="text-red-600 text-sm text-center">
            {{ authStore.error.value }}
          </div>

          <div v-if="validationError" class="text-red-600 text-sm text-center">
            {{ validationError }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.isLoading.value"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="authStore.isLoading.value">Sedang mendaftar...</span>
              <span v-else>Daftar</span>
            </button>
          </div>

          <div class="text-center">
            <router-link
              to="/login"
              class="text-indigo-600 hover:text-indigo-500"
            >
              Sudah punya akun? Masuk di sini
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../../stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  const form = reactive({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  })

  const validationError = computed(() => {
    if (form.password && form.passwordConfirm && form.password !== form.passwordConfirm) {
      return 'Password dan konfirmasi password tidak cocok'
    }
    return null
  })

  const handleRegister = async () => {
    if (validationError.value) {
      return
    }

    try {
      await authStore.register(form.email, form.password, form.passwordConfirm, form.name)
      await authStore.sendVerificationEmail(form.email)
      router.push('/dashboard')
    } catch (error) {
      // Error sudah dihandle di store
      console.error('Register error:', error)
    }
  }
  </script>
