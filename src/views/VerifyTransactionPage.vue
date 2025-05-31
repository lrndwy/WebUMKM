<template>
    <div class="min-h-screen bg-gray-50">
        <Navbar />
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-3xl font-bold text-gray-900 text-center">Verify Transaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div v-if="loading" class="text-center text-gray-600 py-10">
                            <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading transaction details...
                        </div>
                        <div v-else-if="error" class="text-center text-red-600 py-10 font-medium">{{ error }}</div>
                        <div v-else-if="transaction" class="space-y-6 p-5">
                            <p><strong>Order ID:</strong> {{ transaction.id }}</p>
                            <p><strong>Status:</strong> <Badge :variant="getStatusBadgeVariant(transaction.status)">{{ transaction.status }}</Badge></p>
                            <p v-if="parsedOrderDetails"><strong>Total Amount:</strong> Rp {{ (parsedOrderDetails.totalAmount ?? 0).toLocaleString('id-ID') }}</p>
                            <p v-if="transaction.expand?.payment"><strong>Payment Method:</strong> {{ transaction.expand.payment.name }}</p>

                            <div v-if="transaction.proof">
                                <h4 class="font-bold text-lg mt-4 mb-2">Proof of Payment:</h4>
                                <img :src="pb.files.getUrl(transaction, transaction.proof)" alt="Proof of Payment" class="max-w-full h-auto rounded-lg shadow-md">
                            </div>

                            <h4 class="font-bold text-lg mt-4 mb-2">Order Details:</h4>
                            <ul v-if="parsedOrderDetails?.products" class="list-disc pl-5 space-y-2">
                                <li v-for="item in parsedOrderDetails.products" :key="item.productId" class="border-b pb-2 last:border-b-0 last:pb-0">
                                    <div class="flex items-center">
                                        <img :src="getProductImageUrl(item.image) || 'https://via.placeholder.com/50'" alt="Product Image" class="w-12 h-12 object-cover rounded-md mr-3">
                                        <div>
                                            <p class="font-semibold">{{ item.name }}</p>
                                            <p class="text-sm text-gray-600">Quantity: {{ item.quantity }} | Price: Rp {{ item.price.toLocaleString('id-ID') }}</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>

                            <div v-if="transaction.status === 'paid'" class="mt-6">
                                <Button @click="confirmTransaction" :disabled="confirming" class="w-full">
                                    <span v-if="confirming">Confirming...</span>
                                    <span v-else>Confirm Transaction</span>
                                </Button>
                            </div>
                            <div v-else-if="transaction.status === 'confirmed'" class="mt-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-center">
                                <p class="font-medium">This transaction has already been confirmed.</p>
                            </div>
                            <div v-else class="mt-6 p-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-center">
                                <p class="font-medium">Transaction status is {{ transaction.status }}. Only 'paid' transactions can be confirmed here.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Toaster />
    </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { pb } from '../lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'vue-sonner';

interface ProductDetail {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    weight: number;
}

interface OrderDetails {
    products: ProductDetail[];
    totalAmount: number;
    shippingCost: number;
    shippingService: string;
    shippingEtd: string;
    originAddress: string;
    destinationAddress: string;
    totalWeight: number;
}

interface Transaction {
    id: string;
    status: string;
    proof: string;
    payment: string; // RELATION_RECORD_ID to payments
    order_details: string | OrderDetails; // JSON string or parsed object
    total_amount: number;
    expand?: {
        payment: {
            id: string;
            name: string;
            address: string;
            icon: string;
        };
    };
}

const route = useRoute();
const transaction = ref<Transaction | null>(null);
const parsedOrderDetails = ref<OrderDetails | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const confirming = ref(false);

onMounted(async () => {
    const transactionId = route.params.id as string;
    if (transactionId) {
        await fetchTransactionDetails(transactionId);
    } else {
        error.value = 'Transaction ID not provided.';
        loading.value = false;
    }
});

async function fetchTransactionDetails(id: string) {
    loading.value = true;
    error.value = null;
    try {
        const fetchedTransaction = await pb.collection('transaction').getOne<Transaction>(id, {
            expand: 'payment',
        });
        transaction.value = fetchedTransaction;

        if (typeof fetchedTransaction.order_details === 'string') {
            try {
                parsedOrderDetails.value = JSON.parse(fetchedTransaction.order_details) as OrderDetails;
            } catch (e) {
                console.error('Error parsing order details JSON:', e);
                parsedOrderDetails.value = null;
            }
        } else {
            parsedOrderDetails.value = fetchedTransaction.order_details;
        }

    } catch (err: any) {
        console.error('Error fetching transaction details:', err);
        error.value = 'Failed to load transaction details: ' + err.message;
    } finally {
        loading.value = false;
    }
}

function getStatusBadgeVariant(status: string | undefined) {
    switch (status) {
        case 'paid':
            return 'default';
        case 'waiting for payment':
            return 'secondary';
        case 'confirmed':
            return 'default';
        case 'sent':
            return 'default';
        case 'order completed':
            return 'outline';
        default:
            return 'default';
    }
}

function getProductImageUrl(image: string | string[] | undefined): string | undefined {
    if (!image) {
        return undefined;
    }
    if (Array.isArray(image) && image.length > 0) {
        return image[0];
    }
    if (typeof image === 'string') {
        return image;
    }
    return undefined;
}

async function confirmTransaction() {
    if (!transaction.value) {
        toast.error('Error', { description: 'No transaction selected for confirmation.' });
        return;
    }

    confirming.value = true;
    try {
        await pb.collection('transaction').update(transaction.value.id, {
            status: 'confirmed',
        });
        toast.success('Success', { description: 'Transaction status updated to "confirmed".' });
        await fetchTransactionDetails(transaction.value.id); // Re-fetch to update status display
    } catch (err: any) {
        console.error('Error confirming transaction:', err);
        toast.error('Error', { description: 'Failed to confirm transaction: ' + err.message });
    } finally {
        confirming.value = false;
    }
}
</script>
