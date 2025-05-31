
<template>
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Todo List</h1>
      <div v-if="loading" class="text-gray-600">Loading...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else class="space-y-4">
        <div v-for="todo in todos" :key="todo.id" class="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ todo.title }}</h3>
          <p v-if="todo.desc" class="text-gray-600 mb-3">{{ todo.desc }}</p>
          <small class="text-gray-500 text-sm">Created: {{ new Date(todo.created).toLocaleString() }}</small>
        </div>
      </div>
    </div>
  </template>

  <script lang="ts">
  import { ref, onMounted } from 'vue'
  import PocketBase from 'pocketbase'

  // Inisialisasi PocketBase
  // @ts-ignore: Vetur might not recognize import.meta.env correctly
  const pb = new PocketBase(import.meta.env.VITE_PB_URL)

  // Definisikan tipe data untuk koleksi toDo
  interface ToDoRecord {
    id: string
    title: string
    desc: string
    created: string
    [key: string]: any
  }

  export default {
    setup() {
      const todos = ref<ToDoRecord[]>([])
      const loading = ref(true)
      const error = ref('')

      const fetchToDoList = async () => {
        try {
          const records = await pb.collection('toDo').getFullList<ToDoRecord>({
            sort: '-created',
          })
          todos.value = records
          loading.value = false
        } catch (err: any) {
          error.value = 'Error loading todos: ' + err.message
          loading.value = false
          console.error('Error:', err)
        }
      }

      onMounted(() => {
        fetchToDoList()
      })

      return {
        todos,
        loading,
        error
      }
    }
  }
  </script>


