// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { AuthService } from '../lib/pocketbase'

// Import components
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/auth/LoginPage.vue'
import RegisterPage from '../views/auth/RegisterPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import ProfilePage from '../views/auth/ProfilePage.vue'
import NotFoundPage from '../views/auth/NotFoundPage.vue'
import UnauthorizedPage from '../views/auth/UnauthorizedPage.vue'
import CheckoutPage from '../views/CheckoutPage.vue'
import OrderPage from '../views/OrderPage.vue'
import VerifyTransactionPage from '../views/VerifyTransactionPage.vue'
import SettingsPage from '../views/SettingsPage.vue'

// Admin
import AdminDashboardPage from '../views/admin/AdminDashboardPage.vue'
import AdminProductsManagementPage from '../views/admin/AdminProductsManagementPage.vue'
import AdminProfilePage from '@/views/admin/AdminProfilePage.vue'
import AdminSettingsPage from '@/views/admin/AdminSettingsPage.vue'

import { requireRole } from '@/middleware/auth'

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
        path: '/checkout',
        name: 'Checkout',
        component: CheckoutPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/order',
        name: 'Order',
        component: OrderPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/verify-transaction/:id',
        name: 'VerifyTransaction',
        component: VerifyTransactionPage,
        beforeEnter: requireRole('admin'), // This page should be publicly accessible
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: SettingsPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundPage,
        meta: { requiresAuth: false }
    },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        component: UnauthorizedPage,
        meta: { requiresAuth: false }
    },
    // Admin Routes
    {
        path: '/admin',
        name: 'Dashboard Admin',
        component: AdminDashboardPage,
        beforeEnter: requireRole('admin'),
    },
    {
        path: '/admin/products',
        name: 'Products Management',
        component: AdminDashboardPage,
        beforeEnter: requireRole('admin'),
    },
    {
        path: '/admin/settings',
        name: 'Admin Settings',
        component: AdminDashboardPage,
        beforeEnter: requireRole('admin'),
    },
    {
        path: '/admin/profile',
        name: 'Admin Profile',
        component: AdminDashboardPage,
        beforeEnter: requireRole('admin'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation Guard untuk proteksi route
router.beforeEach(async (to, _from, next) => {
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
