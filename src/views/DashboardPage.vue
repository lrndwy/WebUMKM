<!-- views/DashboardPage.vue -->
<template>
    <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <Navbar />

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
                                <span class="font-medium text-gray-500">Roles:</span>
                                <span class="ml-2 text-gray-900">{{ authStore.userRoles.value.join(', ') || '-' }}</span>
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
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
    import Navbar from '../components/Navbar.vue'
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
