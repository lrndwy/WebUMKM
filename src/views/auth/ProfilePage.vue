<!-- views/auth/ProfilePage.vue -->
<template>
    <div class="min-h-screen bg-gray-50">

        <Navbar/>

        <main class="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Profile Saya</h2>

                <div class="mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="text"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            :value="authStore.currentUser.value?.email"
                            disabled
                            />
                    </div>
                </div>

                <div class="mb-4">
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
        </main>
    </div>
</template>

<script setup lang="ts">
    import Navbar from '../../components/Navbar.vue'
    import { reactive, ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '../../stores/auth'
    import { pb } from '../../lib/pocketbase'

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


        isUpdating.value = true
        updateMessage.value = null

        try {
            await pb.collection('users').update(authStore.currentUser.value!.id, {

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
