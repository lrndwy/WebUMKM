<template>
    <!-- Navigation -->
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
            <h1 class="text-xl font-semibold">Dashboard</h1>
            </div>

            <div class="flex items-center space-x-4">
            <span class="text-gray-700">
                Halo, {{ userName }}!
                Roles: {{ userRoles }}
            </span>

            <router-link
                v-for="link in navLinks"
                :key="link.name"
                :to="link.to"
                class="text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
            >
                {{ link.name }}
            </router-link>

            <button
                @click="handleLogout"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                aria-label="Logout"
            >
                Keluar
            </button>
            </div>
        </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default defineComponent({
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const userName = computed(() => authStore.currentUser.value?.name || 'User')
    const userRoles = computed(() => authStore.userRoles.value.join(', ') || '-')

    const navLinks = [
        { name: 'Dashboard', to: '/dashboard' },
        { name: 'Profile', to: '/profile' },
        { name: 'Admin Dashboard', to: '/admin' },
        { name: 'Checkout', to: '/checkout' },
        { name: 'Order', to: '/order' },
    ]

    const handleLogout = () => {
        authStore.logout()
        router.push('/login')
    }

    return {
      userName,
      userRoles,
      navLinks,
      handleLogout
    }
  }
})
</script>
