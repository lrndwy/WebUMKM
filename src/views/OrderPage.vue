<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <Navbar />

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-3xl font-bold text-gray-900 text-center">Your Orders</CardTitle>
                    </CardHeader>
                    <CardContent>

                    <div v-if="loadingTransactions" class="text-center text-gray-600 py-10">
                        <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading your orders...
                    </div>
                    <div v-else-if="errorTransactions" class="text-center text-red-600 py-10 font-medium">{{ errorTransactions }}</div>
                    <div v-else-if="transactions.length === 0" class="text-center text-gray-600 py-10">
                        <p>You haven't placed any orders yet.</p>
                    </div>
                    <div v-else class="space-y-6">
                        <Card v-for="transaction in transactions" :key="transaction.id" class="p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <CardContent class="flex-grow mb-4 md:mb-0 p-0">
                                <p class="text-sm text-gray-500">Order ID: <span class="font-semibold text-gray-700">{{ transaction.id }}</span></p>
                                <p class="text-lg font-bold text-gray-900 mt-1">Total: Rp {{ (typeof transaction.order_details === 'object' ? transaction.order_details.totalAmount : transaction.total_amount ?? 0).toLocaleString('id-ID') }}</p>
                                <p class="font-semibold text-sm mt-1">Status: <Badge :variant="getStatusBadgeVariant(transaction.status)">{{ transaction.status }}</Badge></p>
                                <div v-if="transaction.expand?.payment" class="flex items-center mt-2">
                                    <img :src="getPaymentIconUrl(transaction)" alt="Payment Icon" class="w-8 h-8 object-contain rounded-md mr-2">
                                    <p class="text-sm text-gray-700">Payment via: {{ transaction.expand.payment.name }}</p>
                                </div>
                            </CardContent>
                            <Button @click="viewTransactionDetails(transaction)" variant="default" size="sm">View Details</Button>
                        </Card>
                    </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Transaction Detail Modal -->
            <Dialog :open="showDetailModal" @update:open="showDetailModal = $event">
                <DialogContent class="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Order Details (ID: {{ selectedTransaction?.id }})</DialogTitle>
                        <DialogDescription>
                            View the details of your selected order.
                        </DialogDescription>
                    </DialogHeader>
                    <div class="py-4 px-4 space-y-4 text-gray-700 max-h-[70vh] overflow-y-auto">
                            <p><strong>Status:</strong> <Badge :variant="getStatusBadgeVariant(selectedTransaction?.status)">{{ selectedTransaction?.status }}</Badge></p>
                            <div v-if="selectedTransaction?.status === 'waiting for payment'" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md">
                                <p class="font-medium">Your order is waiting for payment. Please upload your proof of payment.</p>
                                <!-- Proof of Payment Upload Section -->
                                <div class="mt-4 space-y-4">
                                    <FileUpload
                                        id="proof-file-input"
                                        label="Select Proof Image"
                                        accept="image/*"
                                        v-model="proofOfPaymentFile"
                                        :disabled="uploadingProof"
                                    />
                                    <Button @click="uploadProofOfPayment" :disabled="!proofOfPaymentFile || uploadingProof" class="w-full" variant="default">
                                        <span v-if="uploadingProof">Uploading...</span>
                                        <span v-else>Upload Proof and Mark as Paid</span>
                                    </Button>
                                    <p v-if="uploadProofError" class="text-red-600 text-sm mt-2">{{ uploadProofError }}</p>
                                    <!-- Cancel Order Button -->
                                    <AlertDialog>
                                        <AlertDialogTrigger as-child>
                                            <Button variant="destructive" class="w-full mt-2">Cancel Order</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this order
                                                    and remove its data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction @click="cancelTransaction">Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <div v-else-if="selectedTransaction?.status === 'paid'" class="mt-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
                                <p class="font-medium">Waiting for payment confirmation.</p>
                            </div>
                            <div v-else-if="selectedTransaction?.status === 'confirmed'" class="mt-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                                <p class="font-medium">Your order will be processed and shipped as soon as possible.</p>
                            </div>
                            <div v-else-if="selectedTransaction?.status === 'sent'" class="mt-2 p-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-md flex flex-col sm:flex-row items-center justify-between">
                                <p class="font-medium mb-2 sm:mb-0">Confirm order has arrived?</p>
                                <Button @click="confirmOrderArrived" variant="default" size="sm">Confirm Arrival</Button>
                            </div>
                            <p v-if="parsedSelectedOrderDetails"><strong>Total Amount:</strong> Rp {{ (parsedSelectedOrderDetails.totalAmount ?? 0).toLocaleString('id-ID') }}</p>
                            <p v-if="parsedSelectedOrderDetails"><strong>Shipping Cost:</strong> Rp {{ (parsedSelectedOrderDetails.shippingCost ?? 0).toLocaleString('id-ID') }}</p>
                            <p v-if="parsedSelectedOrderDetails"><strong>Shipping Service:</strong> {{ parsedSelectedOrderDetails.shippingService }} (Est. {{ parsedSelectedOrderDetails.shippingEtd }})</p>
                            <p v-if="parsedSelectedOrderDetails"><strong>Origin Address:</strong> {{ parsedSelectedOrderDetails.originAddress }}</p>
                            <p v-if="parsedSelectedOrderDetails"><strong>Destination Address:</strong> {{ parsedSelectedOrderDetails.destinationAddress }}</p>
                            <p v-if="parsedSelectedOrderDetails"><strong>Total Weight:</strong> {{ parsedSelectedOrderDetails.totalWeight }}g</p>
                            <p v-if="selectedTransaction?.created"><strong>Ordered On:</strong> {{ new Date(selectedTransaction.created).toLocaleString() }}</p>

                            <div v-if="selectedTransaction?.expand?.payment">
                                <h4 class="font-bold text-lg mt-4 mb-2">Payment Information:</h4>
                                <div class="flex items-center">
                                    <img :src="getPaymentIconUrl(selectedTransaction)" alt="Payment Icon" class="w-10 h-10 object-contain rounded-md mr-3">
                                    <div>
                                        <p class="font-semibold">{{ selectedTransaction?.expand.payment.name }}</p>
                                        <p class="text-sm">{{ selectedTransaction?.expand.payment.address }}</p>
                                    </div>
                                </div>
                            </div>

                            <div v-if="selectedTransaction?.proof">
                                <h4 class="font-bold text-lg mt-4 mb-2">Proof of Payment:</h4>
                                <img :src="pb.files.getUrl(selectedTransaction, selectedTransaction.proof)" alt="Proof of Payment" class="max-w-full h-auto rounded-lg shadow-md">
                            </div>

                            <h4 class="font-bold text-lg mt-4 mb-2">Order Details:</h4>
                            <ul v-if="parsedSelectedOrderDetails?.products" class="list-disc pl-5 space-y-2">
                                <li v-for="item in parsedSelectedOrderDetails.products" :key="item.productId" class="border-b pb-2 last:border-b-0 last:pb-0">
                                    <div class="flex items-center">
                                        <img :src="getProductImageUrl(item.image) || 'https://via.placeholder.com/50'" alt="Product Image" class="w-12 h-12 object-cover rounded-md mr-3">
                                        <div>
                                            <p class="font-semibold">{{ item.name }}</p>
                                            <p class="text-sm text-gray-600">Quantity: {{ item.quantity }} | Price: Rp {{ item.price.toLocaleString('id-ID') }}</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" class="w-full" @click="closeDetailModal">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import { ref, onMounted } from 'vue';
import { pb } from '../lib/pocketbase';
import { useAuthStore } from '../stores/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input'; // Added for file input
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload'; // Added for file upload component
import { Toaster } from '@/components/ui/sonner'; // Added for toast notifications
import { toast } from 'vue-sonner'; // Added for toast notifications
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_BOT_TELEGRAM_TOKEN;
const OWNER_TELEGRAM_ID = import.meta.env.VITE_OWNER_TELEGRAM_ID;
const APP_URL = import.meta.env.VITE_APP_URL;

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
    ordered_by: string; // RELATION_RECORD_ID to users
    total_amount: number;
    shipping_cost: number;
    shipping_service: string;
    shipping_etd: string;
    origin_address: string;
    destination_address: string;
    total_weight: number;
    created: string;
    updated: string;
    expand?: {
        payment: {
            id: string;
            name: string;
            address: string;
            icon: string;
        };
    };
}

const authStore = useAuthStore();
const transactions = ref<Transaction[]>([]);
const loadingTransactions = ref(true);
const errorTransactions = ref<string | null>(null);
const selectedTransaction = ref<Transaction | null>(null);
const parsedSelectedOrderDetails = ref<OrderDetails | null>(null); // New reactive variable
const showDetailModal = ref(false);
const currentTransactionId = ref<string | null>(null); // To hold the ID of the transaction being processed
const proofOfPaymentFile = ref<File | null>(null); // To hold the selected file
const uploadingProof = ref(false); // To indicate upload in progress
const uploadProofError = ref<string | null>(null); // To display upload errors



onMounted(async () => {
    await fetchUserTransactions();
});

async function fetchUserTransactions() {
    if (!authStore.isAuthenticated || !authStore.currentUser?.value?.id) {
        errorTransactions.value = 'Please log in to view your orders.';
        loadingTransactions.value = false;
        return;
    }

    loadingTransactions.value = true;
    errorTransactions.value = null;
    try {
        const fetchedTransactions = await pb.collection('transaction').getFullList<Transaction>({
            filter: `ordered_by = "${authStore.currentUser.value.id}"`,
            sort: '-created',
            expand: 'payment', // Expand the payment relation
        });

        transactions.value = fetchedTransactions.map(t => {
            if (typeof t.order_details === 'string') {
                try {
                    return { ...t, order_details: JSON.parse(t.order_details) as OrderDetails };
                } catch (e) {
                    console.error('Error parsing order details JSON during fetch:', e);
                    return t; // Return original if parsing fails
                }
            }
            return t;
        });
    } catch (error: any) {
        console.error('Error fetching user transactions:', error);
        errorTransactions.value = 'Failed to fetch orders: ' + error.message;
    } finally {
        loadingTransactions.value = false;
    }
}

function viewTransactionDetails(transaction: Transaction) {
    selectedTransaction.value = transaction;
    console.log('Selected Transaction:', transaction); // Log the full transaction object
    if (typeof transaction.order_details === 'string') {
        try {
            parsedSelectedOrderDetails.value = JSON.parse(transaction.order_details) as OrderDetails;
        } catch (e) {
            console.error('Error parsing order details JSON for display:', e);
            parsedSelectedOrderDetails.value = null;
        }
    } else {
        parsedSelectedOrderDetails.value = transaction.order_details;
    }
    showDetailModal.value = true;

    // Set currentTransactionId if status is 'waiting for payment'
    if (transaction.status === 'waiting for payment') {
        currentTransactionId.value = transaction.id;
        proofOfPaymentFile.value = null; // Clear previous file selection
        uploadProofError.value = null; // Clear previous errors
    } else {
        currentTransactionId.value = null; // Clear if not waiting for payment
    }
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedTransaction.value = null;
    parsedSelectedOrderDetails.value = null; // Clear parsed details on close
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

// Placeholder for toast functionality if not using a specific UI library's toast
function showTemporaryToast(title: string, description: string, variant?: string) {
    console.log(`Toast - ${title}: ${description} (Variant: ${variant || 'default'})`);
    // Using vue-sonner toast for consistency
    if (variant === 'destructive') {
        toast.error(title, { description: description });
    } else {
        toast.success(title, { description: description });
    }
}

async function confirmOrderArrived() {
    if (!selectedTransaction.value) {
        showTemporaryToast('Error', 'No transaction selected.', 'destructive');
        return;
    }

    try {
        await pb.collection('transaction').update(selectedTransaction.value.id, {
            status: 'order completed',
        });
        showTemporaryToast('Success', 'Order status updated to "order completed".');
        closeDetailModal();
        await fetchUserTransactions(); // Refresh the list
    } catch (error: any) {
        console.error('Error confirming order arrival:', error);
        showTemporaryToast('Error', 'Failed to confirm order arrival: ' + error.message, 'destructive');
    }
}

function getPaymentIconUrl(transaction: Transaction): string {
    if (transaction.expand?.payment) {
        return pb.files.getUrl(transaction.expand.payment, transaction.expand.payment.icon);
    }
    return ''; // Or a placeholder image URL
}

function parseOrderDetails(orderDetailsJson: string): ProductDetail[] {
    try {
        const parsed = JSON.parse(orderDetailsJson);
        return parsed.products || []; // Assuming order_details contains a 'products' array
    } catch (e) {
        console.error('Error parsing order details JSON:', e);
        return [];
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


async function uploadProofOfPayment() {
    if (!currentTransactionId.value) {
        uploadProofError.value = 'No active transaction to upload proof for.';
        toast.error('Upload Error', { description: 'No active transaction to upload proof for.' });
        return;
    }
    if (!proofOfPaymentFile.value) {
        uploadProofError.value = 'Please select a file to upload.';
        toast.error('Upload Error', { description: 'Please select a file to upload.' });
        return;
    }

    uploadingProof.value = true;
    uploadProofError.value = null;

    try {
        const formData = new FormData();
        formData.append('proof', proofOfPaymentFile.value);
        formData.append('status', 'paid');

        const updatedTransaction = await pb.collection('transaction').update(currentTransactionId.value, formData);

        // Send Telegram notification
        if (TELEGRAM_BOT_TOKEN && OWNER_TELEGRAM_ID && updatedTransaction) {
            const transactionLink = `${APP_URL}/verify-transaction/${updatedTransaction.id}`;
            const totalAmount = parsedSelectedOrderDetails.value?.totalAmount ?? 0;
            const paymentMethod = selectedTransaction.value?.expand?.payment?.name ?? 'N/A';

            const message = `
New Transaction Paid!
Order ID: ${updatedTransaction.id}
Total Amount: Rp ${totalAmount.toLocaleString('id-ID')}
Payment Method: ${paymentMethod}
Status: ${updatedTransaction.status}
Verify here: ${transactionLink}
            `;
            const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${OWNER_TELEGRAM_ID}&text=${encodeURIComponent(message)}`;

            try {
                await fetch(telegramApiUrl);
                console.log('Telegram notification sent successfully.');
            } catch (telegramError) {
                console.error('Failed to send Telegram notification:', telegramError);
            }
        }

        toast.success('Success', { description: 'Proof of payment uploaded successfully! Transaction status updated to "paid".' });
        console.log('Proof uploaded and status updated for transaction:', currentTransactionId.value);

        // Reset after successful upload
        currentTransactionId.value = null;
        proofOfPaymentFile.value = null; // Reset the v-model, which will clear the FileUpload component
        closeDetailModal(); // Close the modal after successful upload
        await fetchUserTransactions(); // Refresh the list of transactions

    } catch (error: any) {
        console.error('Error uploading proof of payment:', error);
        uploadProofError.value = 'Failed to upload proof: ' + error.message;
        toast.error('Upload Error', { description: 'Failed to upload proof: ' + error.message });
    } finally {
        uploadingProof.value = false;
    }
}

async function cancelTransaction() {
    if (!selectedTransaction.value) {
        toast.error('Cancellation Error', { description: 'No transaction selected for cancellation.' });
        return;
    }

    try {
        await pb.collection('transaction').delete(selectedTransaction.value.id);
        toast.success('Success', { description: 'Order cancelled successfully.' });
        closeDetailModal();
        await fetchUserTransactions(); // Refresh the list
    } catch (error: any) {
        console.error('Error cancelling transaction:', error);
        toast.error('Cancellation Error', { description: 'Failed to cancel order: ' + error.message });
    }
}
</script>
