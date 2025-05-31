<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <h1 class="text-4xl font-bold text-gray-900 text-center mb-8">Our Products</h1>

    <div class="mb-6 text-right">
      <span class="text-lg font-medium">Items in Cart: {{ totalCartItems }}</span>
      <router-link to="/checkout" custom v-slot="{ navigate }">
        <Button @click="navigate" role="link" class="ml-4" variant="default">Go to Checkout</Button>
      </router-link>
    </div>

    <div v-if="loadingProducts" class="text-center text-gray-600 py-10">
      <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading products...
    </div>
    <div v-else-if="errorProducts" class="text-center text-red-600 py-10 font-medium">{{ errorProducts }}</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="product in products" :key="product.id" class="flex flex-col transform hover:scale-105 transition-transform duration-300">
        <CardContent class="p-5">
          <img :src="product.image || 'https://via.placeholder.com/150'" alt="Product Image" class="w-full h-40 object-cover rounded-lg mb-4 shadow-sm">
          <h3 class="text-xl font-bold text-gray-900 mb-1">{{ product.name }}</h3>
          <p class="text-gray-600 text-sm mb-3 flex-grow">{{ product.desc }}</p>
          <div class="flex justify-between items-center mt-auto pt-3 border-t border-gray-200">
            <p class="text-green-700 font-extrabold text-lg">Rp {{ product.price.toLocaleString('id-ID') }}</p>
            <p class="text-gray-500 text-xs">Weight: {{ product.weight }}g</p>
          </div>
          <Button @click="addToCart(product)" class="mt-4 w-full" variant="default">Add to Cart</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { type Product, ProductService, pb } from '../lib/pocketbase'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CartItem extends Product {
  quantity: number;
}

const products = ref<Product[]>([]);
const loadingProducts = ref(true);
const errorProducts = ref<string | null>(null);

const cart = ref<CartItem[]>([]);

onMounted(async () => {
  await fetchProducts();
  loadCartFromSession();
});

async function fetchProducts() {
  try {
    products.value = await ProductService.getAllProducts()
  } catch (error: any) {
    errorProducts.value = error.message
  } finally {
    loadingProducts.value = false
  }
}

function loadCartFromSession() {
  const savedCart = sessionStorage.getItem('cart');
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    cart.value = parsedCart.map((item: { id: string; quantity: number }) => {
      const product = products.value.find(p => p.id === item.id);
      if (product) {
        return { ...product, quantity: item.quantity };
      }
      return null;
    }).filter(Boolean) as CartItem[];
  }
}

function saveCartToSession() {
  const simplifiedCart = cart.value.map(item => ({
    id: item.id,
    quantity: item.quantity
  }));
  sessionStorage.setItem('cart', JSON.stringify(simplifiedCart));
}

function addToCart(product: Product) {
  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
  saveCartToSession();
}

const totalCartItems = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0);
});


</script>
