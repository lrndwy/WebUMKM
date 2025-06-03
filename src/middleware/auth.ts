// middleware/auth.ts - Advanced Route Protection
import type { NavigationGuard } from 'vue-router'
import { AuthService } from '../lib/pocketbase'

// Middleware untuk memerlukan autentikasi
export const requireAuth: NavigationGuard = async (to, _from, next) => {

    if (!AuthService.isAuthenticated()) {
            next({
            path: '/login',
            query: { redirect: to.fullPath }
            })
        } else {
            next()
        }
    }

// Middleware untuk redirect jika sudah login
export const redirectIfAuth: NavigationGuard = async (_to, _from, next) => {
  if (AuthService.isAuthenticated()) {

    if (AuthService.isAuthenticated()) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
}

// Middleware untuk role-based access
export const requireRole = (role: string): NavigationGuard => {
  return async (_to, _from, next) => {
    if (!AuthService.isAuthenticated()) {
      next('/login')
      return
    }

    const user = AuthService.getCurrentUser()
    if (!user || !user.roles || !user.roles.includes(role)) {
      next('/unauthorized') // Buat halaman unauthorized
      return
    }

    next()
  }
}

// Example penggunaan di router:
/*
{
  path: '/admin',
  name: 'Admin',
  component: AdminPage,
  beforeEnter: requireRole('admin')
},
{
  path: '/profile',
  name: 'Profile',
  component: ProfilePage,
  beforeEnter: requireAuth
}
*/
