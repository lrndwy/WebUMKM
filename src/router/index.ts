// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { AuthService } from '../lib/pocketbase'

// Import components
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import NotFoundPage from '../views/NotFoundPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard untuk proteksi route
router.beforeEach(async (to, _from, next) => {
  // Refresh auth token jika ada
  if (AuthService.isAuthenticated()) {
    await AuthService.refreshAuth()
  }

  const isAuthenticated = AuthService.isAuthenticated()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth)

  if (requiresAuth && !isAuthenticated) {
    // Redirect ke login jika route memerlukan autentikasi tapi user belum login
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (redirectIfAuth && isAuthenticated) {
    // Redirect ke dashboard jika user sudah login tapi mengakses login/register
    next('/dashboard')
  } else {
    next()
  }
})

export default router