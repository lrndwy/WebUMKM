<!-- views/ProfilePage.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link 
              to="/dashboard"
              class="text-indigo-600 hover:text-indigo-700"
            >
              ← Kembali ke Dashboard
            </router-link>
          </div>
          
          <div class="flex items-center">
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

    <main class="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Profile Saya</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.currentUser.value?.email }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Status Verifikasi</label>
            <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="authStore.currentUser.value?.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ authStore.currentUser.value?.verified ? 'Terverifikasi' : 'Belum Terverifikasi' }}
            </span>
          </div>
        </div>
        
        <div class="mt-6">
          <button
            @click="updateProfile"
            :disabled="isUpdating"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
        
        <div v-if="updateMessage" class="mt-4 text-sm" :class="updateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'">
          {{ updateMessage.text }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import pb from '../lib/pocketbase'

const router = useRouter()
const authStore = useAuthStore()
const isUpdating = ref(false)
const updateMessage = ref<{type: 'success' | 'error', text: string} | null>(null)

const profileForm = reactive({
  name: ''
})

onMounted(() => {
  if (authStore.currentUser.value) {
    profileForm.name = authStore.currentUser.value.name || ''
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const updateProfile = async () => {
  if (!authStore.currentUser.value) return
  
  isUpdating.value = true
  updateMessage.value = null
  
  try {
    await pb.collection('users').update(authStore.currentUser.value.id, {
      name: profileForm.name
    })
    
    // Refresh auth untuk mendapat data terbaru
    await authStore.refreshAuth()
    
    updateMessage.value = {
      type: 'success',
      text: 'Profile berhasil diperbarui!'
    }
  } catch (error) {
    updateMessage.value = {
      type: 'error',
      text: 'Gagal memperbarui profile. Silakan coba lagi.'
    }
  } finally {
    isUpdating.value = false
  }
}
</script>