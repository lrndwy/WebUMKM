<!-- views/DashboardPage.vue -->
<template>
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">
                Halo, {{ authStore.currentUser.value?.name || 'User' }}!
              </span>
              
              <router-link
                to="/profile"
                class="text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </router-link>
              
              <button
                @click="handleLogout"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>
  
      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                Selamat datang di Dashboard!
              </h2>
              <p class="text-gray-600 mb-6">
                Ini adalah halaman yang dilindungi. Hanya user yang sudah login yang bisa mengakses halaman ini.
              </p>
              
              <!-- User Info Card -->
              <div class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi User</h3>
                <div class="space-y-3 text-left">
                  <div>
                    <span class="font-medium text-gray-500">ID:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.currentUser.value?.id }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-500">Email:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.currentUser.value?.email }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-500">Nama:</span>
                    <span class="ml-2 text-gray-900">{{ authStore.currentUser.value?.name || '-' }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-500">Verified:</span>
                    <span
                      class="ml-2"
                      :class="authStore.currentUser.value?.verified ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ authStore.currentUser.value?.verified ? 'Ya' : 'Tidak' }}
                    </span>

                    <!-- Tombol verifikasi jika belum terverifikasi -->
                    <button
                      v-if="!authStore.currentUser.value?.verified"
                      class="ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      @click="AccountVerification"
                    >
                      Verifikasi
                    </button>
                  </div>

                  <div>
                    <span class="font-medium text-gray-500">Bergabung:</span>
                    <span class="ml-2 text-gray-900">{{ formatDate(authStore.currentUser.value?.created) }}</span>
                  </div>
                </div>
              </div>
  
              <!-- Quick Actions -->
              <div class="mt-8 flex justify-center space-x-4">
                <router-link
                  to="/profile"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Profile
                </router-link>
                <button
                  @click="refreshUserData"
                  :disabled="isRefreshing"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {{ isRefreshing ? 'Memuat...' : 'Refresh Data' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
</template>
  
<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const isRefreshing = ref(false)
  
  const handleLogout = () => {
    authStore.logout()
    router.push('/login')
  }
  
  const refreshUserData = async () => {
    isRefreshing.value = true
    try {
      await authStore.refreshAuth()
    } catch (error) {
      console.error('Error refreshing user data:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  const AccountVerification = async () => {
    // Lakukan proses verifikasi (misalnya kirim email verifikasi)
    console.log("Mengirim email verifikasi...");
    try {
      await authStore.sendVerificationEmail();
      alert("Email verifikasi berhasil dikirim!");
    } catch (error) {
      console.error("Gagal mengirim email verifikasi:", error);
      alert("Gagal mengirim email verifikasi. Silakan coba lagi.");
    }
  };

  
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>