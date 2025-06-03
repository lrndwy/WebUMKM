// composables/useRouteGuard.ts
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export function useRouteGuard() {
  const router = useRouter()
  const authStore = useAuthStore()

  // Computed untuk status autentikasi
  const isAuthenticated = computed(() => authStore.isAuthenticated.value)
  const currentUser = computed(() => authStore.currentUser.value)

  // Function untuk redirect jika tidak terentikasi
  const requireAuth = (redirectTo: string = '/login') => {
    if (!isAuthenticated.value) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  // Function untuk redirect jika sudah terentikasi
  const redirectIfAuth = (redirectTo: string = '/dashboard') => {
    if (isAuthenticated.value) {
      router.push(redirectTo)
      return true
    }
    return false
  }

  // Watcher untuk perubahan status autentikasi
  const watchAuthChanges = (
    onLogin?: () => void,
    onLogout?: () => void
  ) => {
    return watch(
      isAuthenticated,
      (newVal, oldVal) => {
        if (newVal && !oldVal && onLogin) {
          onLogin()
        } else if (!newVal && oldVal && onLogout) {
          onLogout()
        }
      }
    )
  }

  // Function untuk check permission berdasarkan role (jika ada)
  const hasPermission = (requiredRole?: string) => {
    if (!isAuthenticated.value) return false
    
    // Jika tidak ada role yang diperlukan, user yang sudah login bisa akses
    if (!requiredRole) return true
    
    // Check role user (contoh implementasi)
    // const userRole = currentUser.value?.role || 'user'
    // return userRole === requiredRole || userRole === 'admin'
  }

  return {
    isAuthenticated,
    currentUser,
    requireAuth,
    redirectIfAuth,
    watchAuthChanges,
    hasPermission
  }
}