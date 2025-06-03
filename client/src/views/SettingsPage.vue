<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue';
import { getOriginAddressSetting, saveOriginAddressSetting } from '@/lib/settings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RajaOngkirDestination {
    id: string;
    name: string;
    type: string;
    province: string;
    city_id: string;
    subdistrict_id: string;
}

const searchOrigin = ref('');
const originResults = ref<RajaOngkirDestination[]>([]);
const selectedOrigin = ref<RajaOngkirDestination | null>(null);

const RAJAONGKIR_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const RAJAONGKIR_API_KEY = import.meta.env.VITE_RAJAONGKIR_API_KEY; // Keep this for now, though it might not be directly used on the frontend for proxied requests.

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchRajaOngkir(
    searchTerm: string,
    resultsRef: Ref<RajaOngkirDestination[]>,
    logPrefix: string
) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(async () => {
        if (searchTerm.length < 3) {
            resultsRef.value = [];
            return;
        }
        try {
            const options = {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                },
            };
            const response = await fetch(`${RAJAONGKIR_BASE_URL}/api/rajaongkir/destinations?search=${searchTerm}&limit=20&offset=0`, options);
            const responseData = await response.json();
            if (responseData && responseData.data && responseData.data.meta && responseData.data.meta.code === 200) {
                resultsRef.value = responseData.data.data.map((res: any) => ({
                    id: res.id.toString(),
                    name: res.label,
                    type: '',
                    province: res.province_name,
                    city_id: res.city_id || '',
                    subdistrict_id: res.subdistrict_id || '',
                }));
            } else { // If the expected structure is not found, log the full responseData for debugging
                console.error(`${logPrefix} Error:`, responseData.data?.meta?.message || 'Invalid API response structure', responseData);
                resultsRef.value = []; // Clear results to prevent displaying malformed data
            }
        } catch (error) {
            console.error(`Error searching ${logPrefix.toLowerCase()}:`, error);
            resultsRef.value = [];
        }
    }, 500);
}

function searchRajaOngkirOrigin() {
    searchRajaOngkir(searchOrigin.value, originResults, 'Raja Ongkir Origin');
}

function selectOrigin(orig: RajaOngkirDestination) {
    selectedOrigin.value = orig;
    searchOrigin.value = `${orig.name}, ${orig.province}`;
    originResults.value = [];
}

onMounted(async () => {
  try {
    const originAddress = await getOriginAddressSetting();
    if (originAddress) {
      selectedOrigin.value = originAddress;
      searchOrigin.value = `${originAddress.name}, ${originAddress.province}`;
    }
  } catch (error) {
    console.error('Failed to load app settings:', error);
    alert('Gagal memuat pengaturan aplikasi.');
  }
});

async function saveSettings() {
  try {
    await saveOriginAddressSetting(selectedOrigin.value);
    alert('Pengaturan berhasil disimpan!');
  } catch (error) {
    console.error('Failed to save app settings:', error);
    alert('Gagal menyimpan pengaturan aplikasi.');
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Pengaturan Aplikasi</h1>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <label for="origin" class="block text-sm font-medium text-gray-700">Alamat Asal (Raja Ongkir)</label>
        <Input
          id="origin"
          v-model="searchOrigin"
          type="text"
          class="mt-1 block w-full"
          placeholder="Cari kota atau kecamatan"
          @input="searchRajaOngkirOrigin"
        />
        <ul v-if="originResults.length > 0" class="border border-gray-300 rounded-lg mt-2 max-h-48 overflow-y-auto bg-white shadow-lg z-10 relative">
            <li v-for="orig in originResults" :key="orig.id" @click="selectOrigin(orig)" class="p-3 cursor-pointer hover:bg-blue-50 transition-colors duration-200 text-gray-800">
                {{ orig.type }} {{ orig.name }} ({{ orig.province }})
            </li>
        </ul>
        <p v-if="selectedOrigin" class="mt-3 text-sm text-gray-600 font-medium">Terpilih: <span class="text-blue-700">{{ selectedOrigin.type }} {{ selectedOrigin.name }} ({{ selectedOrigin.province }})</span></p>
      </div>

      <Button @click="saveSettings" :disabled="!selectedOrigin">Simpan Pengaturan</Button>
    </div>
  </div>
</template>
