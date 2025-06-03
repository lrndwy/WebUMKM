<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 class="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">Akses Ditolak</h1>
      <p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <router-link to="/" class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
        Kembali ke Beranda
      </router-link>
    </div>
  </div>
</template>
