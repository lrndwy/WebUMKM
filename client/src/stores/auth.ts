// stores/auth.ts
import { reactive, computed } from 'vue'
import { AuthService, type User } from '../lib/pocketbase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const state = reactive<AuthState>({
  user: null, // Initialize user as null, will be set by the onChange listener
  loading: false,
  error: null
})

// Initialize user state based on current PocketBase auth status
if (AuthService.isAuthenticated()) {
  state.user = AuthService.getCurrentUser()
}

// Listen for changes in PocketBase auth store
AuthService.onAuthStoreChange((user) => {
  state.user = user
})

export const useAuthStore = () => {
  // Computed properties
  const isAuthenticated = computed(() => AuthService.isAuthenticated())
  const currentUser = computed(() => state.user)
  const isLoading = computed(() => state.loading)
  const error = computed(() => state.error)
  const userRoles = computed(() => state.user?.roles || [])

  // Actions
  const login = async (email: string, password: string) => {
    state.loading = true
    state.error = null

    try {
      const user = await AuthService.login(email, password)
      state.user = user
      return user
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Login gagal'
      throw err
    } finally {
      state.loading = false
    }
  }

  const register = async (email: string, password: string, passwordConfirm: string, name?: string) => {
    state.loading = true
    state.error = null

    try {
      const user = await AuthService.register(email, password, passwordConfirm, name)
      state.user = user
      return user
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Registrasi gagal'
      throw err
    } finally {
      state.loading = false
    }
  }

  const logout = () => {
    AuthService.logout()
    state.user = null
    state.error = null
  }


  const clearError = () => {
    state.error = null
  }

  const sendVerificationEmail = async (email?: string) => {
    const targetEmail = email || state.user?.email;

    if (!targetEmail) {
      throw new Error('Email address is not available for verification.');
    }

    try {
      await AuthService.sendVerificationEmail(targetEmail);
      return true;
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to send verification email';
      throw err;
    }
  }


  return {
    // State
    isAuthenticated,
    currentUser,
    isLoading,
    error,
    userRoles,

    // Actions
    login,
    register,
    logout,
    clearError,
    sendVerificationEmail,
    refreshAuth: AuthService.refreshAuth // Expose refreshAuth
  }
}
