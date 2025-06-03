<!-- views/auth/LoginPage.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke akun Anda
          </h2>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                required
                class="relative block w-full px-3 py-2 border border-gray-300 rounded-t-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email"
                :disabled="authStore.isLoading.value"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="relative block w-full px-3 py-2 border border-gray-300 rounded-b-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
                :disabled="authStore.isLoading.value"
              />
            </div>
          </div>

          <div v-if="authStore.error.value" class="text-red-600 text-sm text-center">
            {{ authStore.error.value }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.isLoading.value"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="authStore.isLoading.value">Sedang masuk...</span>
              <span v-else>Masuk</span>
            </button>
          </div>

          <div class="text-center">
            <router-link
              to="/register"
              class="text-indigo-600 hover:text-indigo-500"
            >
              Belum punya akun? Daftar di sini
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </template>

<script setup lang="ts">
    import { Button } from '@/components/ui/button'

    import { reactive } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { useAuthStore } from '../../stores/auth'

    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const form = reactive({
        email: '',
        password: ''
    })

    const handleLogin = async () => {
        try {
        await authStore.login(form.email, form.password)

        // Check user roles after successful login
        if (authStore.currentUser.value && authStore.userRoles.value.includes('admin')) {
          router.push('/admin'); // Redirect admin to /admin dashboard
        } else {
          // Redirect ke halaman yang diminta atau dashboard
          const redirectTo = (route.query.redirect as string) || '/dashboard'
          router.push(redirectTo)
        }
        } catch (error) {
        // Error sudah dihandle di store
        console.error('Login error:', error)
        }
    }
</script>
