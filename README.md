# Vue 3 + TypeScript + PocketBase Setup Guide

## 🚀 Instalasi dan Setup

### 1. Install Dependencies
```bash
npm install vue-router@4 pocketbase
npm install -D typescript @types/node
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Setup PocketBase Server
1. Download PocketBase dari [pocketbase.io](https://pocketbase.io/)
2. Jalankan server: `./pocketbase serve`
3. Buka `http://127.0.0.1:8090/_/` untuk admin dashboard
4. Buat collection `users` dengan field yang diperlukan

### 3. Struktur Folder
```
src/
├── lib/
│   └── pocketbase.ts          # PocketBase config & Auth service
├── stores/
│   └── auth.ts                # Auth store/composable
├── router/
│   └── index.ts               # Vue Router config
├── views/
│   ├── HomePage.vue           # Public page
│   ├── LoginPage.vue          # Login form
│   ├── RegisterPage.vue       # Register form
│   ├── DashboardPage.vue      # Protected page
│   ├── ProfilePage.vue        # Protected profile page
│   └── NotFoundPage.vue       # 404 page
├── composables/
│   └── useRouteGuard.ts       # Route guard helpers
├── middleware/
│   └── auth.ts                # Advanced middleware
└── App.vue
```

## 🛡️ Cara Menggunakan Route Protection

### 1. Basic Route Protection (di router)
```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: DashboardPage,
  meta: { requiresAuth: true }  // 👈 Ini yang melindungi route
}
```

### 2. Menggunakan Composable di Component
```vue
<script setup>
import { useRouteGuard } from '@/composables/useRouteGuard'

const { requireAuth, isAuthenticated } = useRouteGuard()

// Protect component secara manual
onMounted(() => {
  requireAuth() // Redirect ke login jika belum login
})
</script>
```

### 3. Advanced Middleware
```typescript
// Di router/index.ts
import { requireAuth, requireRole } from '@/middleware/auth'

{
  path: '/admin',
  component: AdminPage,
  beforeEnter: requireRole('admin')  // Hanya admin yang bisa akses
}
```

## 🔐 Auth Service Methods

### Login
```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

try {
  await authStore.login('user@example.com', 'password123')
  // User berhasil login, akan redirect otomatis
} catch (error) {
  console.error('Login gagal:', error.message)
}
```

### Register
```typescript
try {
  await authStore.register('user@example.com', 'password123', 'password123', 'Nama User')
  // User berhasil register dan auto login
} catch (error) {
  console.error('Register gagal:', error.message)
}
```

### Logout
```typescript
authStore.logout()
// User akan logout dan bisa redirect ke halaman login
```

### Check Auth Status
```typescript
// Reactive state
const isLoggedIn = authStore.isAuthenticated
const currentUser = authStore.currentUser

// Manual check
if (AuthService.isAuthenticated()) {
  console.log('User sudah login')
}
```

## 🎯 Fitur-Fitur Utama

### ✅ Yang Sudah Termasuk:
- ✨ **Vue 3 Composition API** dengan TypeScript
- 🛡️ **Route Protection** otomatis dengan navigation guards
- 🔐 **PocketBase Authentication** terintegrasi
- 📱 **Responsive Design** dengan Tailwind CSS
- 🔄 **Auto Token Refresh** untuk keamanan
- 🎨 **Clean UI Components** dengan loading states
- 🚦 **Error Handling** yang comprehensive
- 📝 **Form Validation** built-in
- 🏠 **Navigation Guards** untuk redirect otomatis

### 🛡️ Security Features:
- Token refresh otomatis
- Protected routes dengan meta tags
- Redirect handling untuk UX yang smooth
- Error boundaries untuk auth failures
- Secure logout dengan token cleanup

### 🎨 UI/UX Features:
- Loading states pada semua form
- Error messages yang user-friendly
- Responsive navigation
- Clean dashboard dengan user info
- Profile management
- 404 page handling

## 🔧 Customization

### Menambah Route Baru yang Protected:
```typescript
// Di router/index.ts
{
  path: '/settings',
  name: 'Settings',
  component: SettingsPage,
  meta: { requiresAuth: true }  // 👈 Protected route
}
```

### Menambah Field di User Profile:
```typescript
// Update interface User di lib/pocketbase.ts
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  phone?: string     // 👈 Field baru
  role?: string      // 👈 Field baru
  verified: boolean
  created: string
  updated: string
}
```

### Custom Navigation Guard:
```typescript
// Di router beforeEach
router.beforeEach(async (to, from, next) => {
  // Custom logic untuk route protection
  const isAuthenticated = AuthService.isAuthenticated()
  const userRole = AuthService.getCurrentUser()?.role

  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next('/unauthorized')
    return
  }
  
  // ... logic lainnya
})
```

## 🚨 Troubleshooting

### Error "PocketBase connection failed":
- Pastikan PocketBase server berjalan di `http://127.0.0.1:8090`
- Check CORS settings di PocketBase
- Verify environment variables

### Route tidak ter-protect:
- Pastikan `meta: { requiresAuth: true }` ada di route definition
- Check navigation guard di router/index.ts
- Verify auth state di browser dev tools

### Token expired errors:
- Auth service sudah handle auto refresh
- Check network tab untuk failed refresh requests
- Verify PocketBase token expiry settings

## 📚 Next Steps

1. **Add Role-Based Access Control (RBAC)**
2. **Implement Email Verification**
3. **Add Password Reset Functionality**
4. **Setup File Upload untuk Avatar**
5. **Add Real-time Updates dengan PocketBase realtime**
6. **Implement Caching Strategy**
7. **Add Unit Tests untuk Auth Logic**

## 📦 Build dan Jalankan dengan Docker

Untuk membangun dan menjalankan aplikasi menggunakan Docker, ikuti langkah-langkah berikut:

### 1. Build Docker Image

Pastikan Anda berada di direktori root proyek yang berisi `Dockerfile`. Jalankan perintah berikut untuk membangun image Docker:

```bash
docker build -t webumkm-app .
```
Perintah ini akan membangun image Docker dengan nama `webumkm-app`.

### 2. Jalankan Docker Container

Setelah image berhasil dibangun, Anda dapat menjalankan container. Pastikan PocketBase server Anda berjalan dan dapat diakses (misalnya di `http://127.0.0.1:8090`).

```bash
docker run -p 8080:80 --name webumkm-container webumkm-app
```

- `-p 8080:80`: Memetakan port 80 dari container ke port 8080 di host Anda. Anda bisa mengakses aplikasi di `http://localhost:8080`.
- `--name webumkm-container`: Memberikan nama pada container untuk memudahkan pengelolaan.

Jika Anda perlu menghubungkan aplikasi Docker ke PocketBase yang berjalan di container Docker lain, Anda mungkin perlu menggunakan jaringan Docker dan nama service.

Setup ini memberikan foundation yang solid untuk aplikasi Vue.js dengan autentikasi yang aman dan scalable! 🎉