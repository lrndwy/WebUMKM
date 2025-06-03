<template>
    <div class="min-h-screen bg-gray-50">
        <Navbar/>
        <Toaster position="top-right" richColors />

        <main class="max-w-8xl mx-auto p-8">
            <h1 class="text-4xl font-extrabold mb-10 text-center text-gray-900">Secure Checkout</h1>

            <div class="flex flex-col items-center justify-start w-full gap-10">
                <div class="w-full">
                    <Form
                        v-slot="{ values }"
                        as="" keep-values :validation-schema="toTypedSchema(formSchema[stepIndex - 1])"
                    >
                        <form
                            @submit="(e) => {
                                e.preventDefault()
                                if (stepIndex === steps.length) {
                                    onSubmit(values)
                                }
                            }"
                        >
                            <div class="flex w-full flex-start gap-2">
                                <div
                                    v-for="(step, index) in steps"
                                    :key="step.step"
                                    class="relative flex w-full flex-col items-center justify-center"
                                >
                                    <div
                                        v-if="step.step !== steps[steps.length - 1].step"
                                        class="absolute left-[calc(50%+32px)] right-[calc(-50%+22px)] top-6 block h-0.5 shrink-0 rounded-full bg-muted"
                                        :class="{ 'bg-primary': stepIndex > index + 1 }"
                                    />

                                    <Button
                                        :variant="stepIndex === step.step || stepIndex > step.step ? 'default' : 'outline'"
                                        size="icon-xl"
                                        class="z-10 rounded-full shrink-0"
                                        :class="[stepIndex === step.step && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
                                        :disabled="stepIndex < step.step"
                                        @click="stepIndex = step.step"
                                    >
                                        <Check v-if="stepIndex > step.step" class="size-8" />
                                        <component :is="step.icon" v-else class="size-8" />
                                    </Button>

                                    <div class="mt-5 flex flex-col items-center text-center">
                                        <h3
                                            :class="[stepIndex === step.step && 'text-primary']"
                                            class="text-sm font-semibold transition lg:text-base"
                                        >
                                            {{ step.title }}
                                        </h3>
                                        <p
                                            :class="[stepIndex === step.step && 'text-primary']"
                                            class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
                                        >
                                            {{ step.description }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col gap-4 mt-4">
                                <template v-if="stepIndex === 1">
                                    <Card v-if="stepIndex === 1" class="flex flex-col flex-grow">
                                        <CardHeader>
                                            <CardTitle class="text-3xl font-bold text-gray-800">Shopping Cart ({{ totalCartItems }} items)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <div v-if="cart.length === 0" class="text-gray-600 text-center py-10 flex-grow flex items-center justify-center">
                                            <p>Your cart is empty. Add some products!</p>
                                        </div>
                                        <div v-else class="flex-grow space-y-5 overflow-y-auto pr-2 -mr-2">
                                            <div v-for="item in cart" :key="item.id" class="flex items-center border-b pb-4 border-gray-200 last:border-b-0 last:pb-0">
                                                <img :src="getProductImageUrl(item.image) || 'https://via.placeholder.com/80'" alt="Product Image" class="w-24 h-24 object-cover rounded-lg mr-5 shadow-sm">
                                                <div class="flex-grow">
                                                    <p class="font-semibold text-gray-800 text-lg">{{ item.name }}</p>
                                                    <p class="text-sm text-gray-600 mb-2">Rp {{ item.price.toLocaleString('id-ID') }}</p>
                                                    <div class="flex items-center">
                                                        <Button @click="decreaseQuantity(item.id)" variant="outline" size="sm">-</Button>
                                                        <span class="px-4 py-1 text-base font-medium text-gray-800">{{ item.quantity }}</span>
                                                        <Button @click="increaseQuantity(item.id)" variant="outline" size="sm">+</Button>
                                                        <Button @click="removeFromCart(item.id)" variant="ghost" class="ml-auto text-red-600 hover:text-red-800">Remove</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex justify-between items-center pt-6 border-t border-gray-200 mt-auto">
                                            <p class="text-xl font-bold text-gray-900">Total:</p>
                                            <p class="text-xl font-bold text-gray-900">Rp {{ totalCartPrice.toLocaleString('id-ID') }}</p>
                                        </div>
                                        </CardContent>
                                    </Card>
                                </template>

                                <template v-if="stepIndex === 2">
                                    <Card v-if="stepIndex === 2">
                                        <CardHeader>
                                            <CardTitle class="text-3xl font-bold text-gray-800">Shipping Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <div class="space-y-5">
                                            <div>
                                                <label class="block text-sm font-semibold text-gray-700 mb-1">Sent From </label>
                                                <p v-if="selectedOrigin" class="mt-1 text-base text-gray-800 font-medium">
                                                    {{ selectedOrigin.type }} {{ selectedOrigin.name }} ({{ selectedOrigin.province }})
                                                </p>
                                                <p v-else class="mt-1 text-base text-red-500">
                                                    Alamat asal belum diatur. Silakan atur di halaman pengaturan.
                                                </p>
                                            </div>

                                            <div>
                                                <label for="destination" class="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
                                                <Input type="text" id="destination" v-model="searchDestination" @input="searchRajaOngkirDestination" placeholder="Search city or subdistrict" />
                                                <ul v-if="destinationResults.length > 0" class="border border-gray-300 rounded-lg mt-2 max-h-48 overflow-y-auto bg-white shadow-lg z-10 relative">
                                                    <li v-for="dest in destinationResults" :key="dest.id" @click="selectDestination(dest)" class="p-3 cursor-pointer hover:bg-blue-50 transition-colors duration-200 text-gray-800">
                                                        {{ dest.type }} {{ dest.name }} ({{ dest.province }})
                                                    </li>
                                                </ul>
                                                <p v-if="selectedDestination" class="mt-3 text-sm text-gray-600 font-medium">Selected: <span class="text-blue-700">{{ selectedDestination.type }} {{ selectedDestination.name }} ({{ selectedDestination.province }})</span></p>
                                            </div>

                                            <div>
                                                <label for="courier" class="block text-sm font-semibold text-gray-700 mb-1">Courier</label>
                                                <select id="courier" v-model="selectedCourier" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800">
                                                    <option value="">Select Courier</option>
                                                    <option v-for="courier in availableCouriers" :key="courier.code" :value="courier.code">{{ courier.name }}</option>
                                                </select>
                                            </div>

                                            <Button @click="calculateShippingCost" :disabled="!selectedDestination?.id || !selectedCourier || totalCartItems === 0" class="w-full" variant="default">Calculate Shipping</Button>

                                            <div v-if="shippingCostLoading" class="text-center text-gray-600 py-4">Calculating shipping...</div>
                                            <div v-else-if="shippingCostError" class="text-center text-red-600 py-4 font-medium">{{ shippingCostError }}</div>
                                            <div v-else-if="shippingCosts.length > 0" class="mt-5 border-t pt-5 border-gray-200">
                                                <h4 class="font-bold mb-3 text-gray-800 text-lg">Available Services:</h4>
                                                <div v-for="cost in shippingCosts" :key="cost.service" @click="selectShippingService(cost)"
                                                    :class="{'bg-blue-50 border-blue-500 ring-2 ring-blue-500': selectedShippingService?.service === cost.service}"
                                                    class="flex justify-between items-center mb-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 shadow-sm">
                                                    <div>
                                                        <p class="font-semibold text-gray-800">{{ cost.service }} ({{ cost.description }})</p>
                                                        <p class="text-sm text-gray-600">Est. {{ cost.etd }}</p>
                                                    </div>
                                                    <p class="font-bold text-blue-700">Rp {{ cost.cost.toLocaleString('id-ID') }}</p>
                                                </div>
                                                <p v-if="selectedShippingService" class="text-xl font-bold mt-5 text-gray-900">
                                                    Selected Shipping: <span class="text-blue-700">Rp {{ selectedShippingService.cost.toLocaleString('id-ID') }}</span>
                                                </p>
                                            </div>
                                            <div v-if="shippingCosts.length > 0 && !selectedShippingService" class="mt-5 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center font-medium">
                                                Please select one of the available shipping services to proceed.
                                            </div>
                                        </div>
                                        </CardContent>
                                    </Card>
                                    <Card v-if="shippingCosts.length > 0 && stepIndex === 2">
                                        <CardContent class="p-8">
                                            <p class="text-2xl font-extrabold text-gray-900">Grand Total: <span class="text-green-700">Rp {{ grandTotal.toLocaleString('id-ID') }}</span></p>
                                        </CardContent>
                                    </Card>
                                </template>

                                <template v-if="stepIndex === 3">
                                    <Card v-if="stepIndex === 3">
                                        <CardHeader>
                                            <CardTitle class="text-3xl font-bold text-gray-800">Payment Method</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <div v-if="loadingPayments" class="text-center text-gray-600 py-10">
                                            Loading payment methods...
                                        </div>
                                        <div v-else-if="errorPayments" class="text-center text-red-600 py-10 font-medium">{{ errorPayments }}</div>
                                        <div v-else class="space-y-4">
                                            <div v-for="payment in payments" :key="payment.id"
                                                @click="selectPaymentMethod(payment)"
                                                :class="{'bg-blue-50 border-blue-500 ring-2 ring-blue-500': selectedPayment?.id === payment.id}"
                                                class="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 shadow-sm">
                                                <img :src="getPaymentImageUrl(payment)" alt="Payment Icon" class="w-12 h-12 object-contain rounded-md mr-4">
                                                <div>
                                                    <p class="font-semibold text-gray-800 text-lg">{{ payment.name }}</p>
                                                    <p class="text-sm text-gray-600">{{ payment.address }}</p>
                                                </div>
                                            </div>
                                            <div v-if="selectedPayment" class="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h3 class="font-bold text-blue-800 mb-2">Selected Payment:</h3>
                                                <div class="flex items-center">
                                                    <img :src="getPaymentImageUrl(selectedPayment)" alt="Selected Payment Icon" class="w-10 h-10 object-contain rounded-md mr-3">
                                                    <div>
                                                        <p class="font-semibold text-blue-700">{{ selectedPayment.name }}</p>
                                                        <p class="text-sm text-blue-600">{{ selectedPayment.address }}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </CardContent>
                                    </Card>
                                    <Button v-if="stepIndex === 3 && !currentTransactionId" @click="proceedToPayment" :disabled="isProceedToPaymentDisabled || processingPayment" class="w-full mt-6" size="lg">
                                        <span v-if="processingPayment">Processing Payment...</span>
                                        <span v-else>Proceed to Payment (Rp {{ grandTotal.toLocaleString('id-ID') }})</span>
                                    </Button>

                                    <!-- Proof of Payment Upload Section -->
                                    <Card v-if="currentTransactionId" id="proof-of-payment-section" class="mt-8">
                                        <CardHeader>
                                            <CardTitle class="text-3xl font-bold text-gray-800">Upload Proof of Payment</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <p class="text-gray-700 mb-4">Your transaction has been created. Please upload your proof of payment for transaction ID: <span class="font-bold text-blue-700">{{ currentTransactionId }}</span></p>
                                        <div class="space-y-4">
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
                                        </div>
                                        </CardContent>
                                    </Card>
                                </template>
                            </div>

                            <div class="flex items-center justify-between mt-4">
                                <Button :disabled="stepIndex === 1 || stepIndex === steps.length" variant="outline" size="lg" @click="stepIndex--">
                                    Back
                                </Button>
                                <div class="flex items-center gap-3">
                                    <Button
                                        v-if="stepIndex !== steps.length"
                                        type="button"
                                        :disabled="isNextButtonDisabled"
                                        size="lg"
                                        @click="handleNext"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
    import Navbar from '../components/Navbar.vue'
    import { ref, onMounted, computed, watch, h, type Ref } from 'vue'
    import { type Product, ProductService, pb } from '../lib/pocketbase'
    import { Button } from '../components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
    import { Input } from '../components/ui/input';
    import { Label } from '../components/ui/label';
    import { FileUpload } from '../components/ui/file-upload';
    import { Toaster } from '../components/ui/sonner';
    import { toast } from 'vue-sonner'
    import { useRouter } from 'vue-router';
    import { getOriginAddressSetting } from '@/lib/settings';

    import { toTypedSchema } from '@vee-validate/zod'
    import { Check, ShoppingCart, Truck, CreditCard } from 'lucide-vue-next'
    import * as z from 'zod'
    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
    import { useForm } from 'vee-validate'


    const formSchema = [
      z.object({}), // Step 1: Shopping Cart - No form fields here, validation handled by cart content check
      z.object({ // Step 2: Shipping Information
        // selectedOriginId is now derived from settings, not user input
        selectedDestinationId: z.string().min(1, 'Please select a destination city/subdistrict.'),
        selectedCourier: z.string().min(1, 'Please select a courier.'),
        selectedShippingServiceCost: z.number().min(1, 'Please calculate and select a shipping service.'),
      }),
      z.object({ // Step 3: Payment Method
        selectedPaymentId: z.string().min(1, 'Please select a payment method.'),
      }),
    ]

interface Payment {
    id: string;
    name: string;
    address: string;
    icon: string;
    collectionId: string;
    collectionName: string;
}

interface OrderDetails {
    products: CartItem[];
    totalAmount: number;
    shippingCost: number;
    shippingService: string;
    shippingEtd: string;
    originAddress: string;
    destinationAddress: string;
    totalWeight: number;
}

interface CartItem extends Product {
    quantity: number;
}

interface RajaOngkirDestination {
    id: string;
    name: string;
    type: string;
    province: string;
    city_id: string;
    subdistrict_id: string;
}

interface RajaOngkirCost {
    service: string;
    description: string;
    cost: number;
    etd: string;
    note: string;
}

import { useAuthStore } from '../stores/auth';

 const { setFieldValue, validate, meta, errors: formErrors } = useForm()

 const stepIndex = ref(1)

async function handleNext() {
    const { valid } = await validate();
    console.log(`handleNext called. Current step: ${stepIndex.value}, Form valid: ${valid}`);
    console.log(`Debug - totalCartItems: ${totalCartItems.value}`);
    // console.log(`Debug - selectedOrigin.value?.id: ${selectedOrigin.value?.id}`); // No longer user input
    console.log(`Debug - selectedDestination.value?.id: ${selectedDestination.value?.id}`);
    console.log(`Debug - selectedCourier.value: ${selectedCourier.value}`);
    console.log(`Debug - selectedShippingService.value: ${selectedShippingService.value}`);
    console.log(`Debug - meta.valid in handleNext: ${valid}`);
    console.log(`Debug - disabled condition for Next button: ${!valid || (stepIndex.value === 1 && totalCartItems.value === 0) || (stepIndex.value === 2 && !selectedShippingService.value)}`);
    console.log(`Debug - Form values for current step:`, {
        selectedOriginId: selectedOrigin.value?.id,
        selectedDestinationId: selectedDestination.value?.id,
        selectedCourier: selectedCourier.value,
        selectedShippingServiceCost: selectedShippingService.value?.cost,
    });
    console.log(`Debug - Form errors for current step:`, formErrors.value);


    if (stepIndex.value === 1) {
        if (totalCartItems.value === 0) {
            toast.error('Your cart is empty. Please add products to proceed.');
            return;
        }
    }

    if (valid) {
        stepIndex.value++;
    } else {
        if (stepIndex.value === 2) {
            let errorMessage = 'Please fill in all required shipping details:';
            // if (formErrors.value.selectedOriginId) errorMessage += '\n- Origin'; // No longer user input
            if (formErrors.value.selectedDestinationId) errorMessage += '\n- Destination';
            if (formErrors.value.selectedCourier) errorMessage += '\n- Courier';
            if (formErrors.value.selectedShippingServiceCost) errorMessage += '\n- Select a shipping service';
            toast.error(errorMessage);
        } else {
            // Generic error if specific checks above didn't catch it, but form is still invalid
            toast.error('Please fill in all required fields correctly to proceed.');
        }
    }
}

const steps = [
  {
    step: 1,
    title: 'Shopping Cart',
    description: 'Review your items',
    icon: ShoppingCart,
  },
  {
    step: 2,
    title: 'Shipping Information',
    description: 'Enter delivery details',
    icon: Truck,
  },
  {
    step: 3,
    title: 'Payment Method',
    description: 'Select payment option',
    icon: CreditCard,
  },
]

const authStore = useAuthStore();

const products = ref<Product[]>([]);
const loadingProducts = ref(true);
const errorProducts = ref<string | null>(null);

const payments = ref<Payment[]>([]);
const loadingPayments = ref(true);
const errorPayments = ref<string | null>(null);
const selectedPayment = ref<Payment | null>(null);
const currentTransactionId = ref<string | null>(null);
const proofOfPaymentFile = ref<File | null>(null);
const uploadingProof = ref(false);
const uploadProofError = ref<string | null>(null);
const processingPayment = ref(false); // New ref for payment processing state
const router = useRouter();

const cart = ref<CartItem[]>([]);

const selectedOrigin = ref<RajaOngkirDestination | null>(null) // No longer user input

const searchDestination = ref('')
const destinationResults = ref<RajaOngkirDestination[]>([])
const selectedDestination = ref<RajaOngkirDestination | null>(null)

const availableCouriers = ref([
    { code: 'jne', name: 'JNE' },
    { code: 'sicepat', name: 'SiCepat' },
    { code: 'ide', name: 'ID Express' },
    { code: 'sap', name: 'SAP Express' },
    { code: 'jnt', name: 'J&T Express' },
    { code: 'ninja', name: 'Ninja Express' },
    { code: 'tiki', name: 'Tiki' },
    { code: 'lion', name: 'Lion Parcel' },
    { code: 'anteraja', name: 'AnterAja' },
    { code: 'pos', name: 'POS Indonesia' },
    { code: 'ncs', name: 'NCS' },
    { code: 'rex', name: 'REX' },
    { code: 'rpx', name: 'RPX' },
    { code: 'sentral', name: 'Sentral Cargo' },
    { code: 'wahana', name: 'Wahana' },
    { code: 'dse', name: 'DSE' }
])
const selectedCourier = ref('')
const shippingCosts = ref<RajaOngkirCost[]>([])
const shippingCostLoading = ref(false)
const shippingCostError = ref<string | null>(null)
const selectedShippingService = ref<RajaOngkirCost | null>(null)

const RAJAONGKIR_BASE_URL = '/rajaongkir'

const RAJAONGKIR_API_KEY = import.meta.env.VITE_RAJAONGKIR_API_KEY;

// No longer watching selectedOrigin as it's not user input

watch(selectedDestination, (newVal) => {
    setFieldValue('selectedDestinationId', newVal?.id || '')
})

watch(selectedCourier, (newVal) => {
    setFieldValue('selectedCourier', newVal || '')
})

watch(selectedShippingService, (newVal) => {
    setFieldValue('selectedShippingServiceCost', newVal?.cost || 0)
    console.log('Watch: selectedShippingService changed to:', newVal);
    console.log('Setting selectedShippingServiceCost to:', newVal?.cost || 0);
    console.log('Watch: meta.valid after setting selectedShippingServiceCost:', meta.value.valid);
})

watch(selectedPayment, (newVal) => {
    setFieldValue('selectedPaymentId', newVal?.id || '')
})

onMounted(async () => {
    await fetchProducts();
    await fetchPayments();
    loadCartFromSession();
    const originAddressSetting = await getOriginAddressSetting(); // Await needed here
    if (originAddressSetting) {
        selectedOrigin.value = originAddressSetting;
        // No need to set searchOrigin as it's not an input field anymore
    } else {
        toast.error('Alamat asal belum diatur. Silakan atur di halaman pengaturan.');
    }
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

async function fetchPayments() {
    try {
        payments.value = await pb.collection('payments').getFullList<Payment>({
            sort: 'name',
        });
    } catch (error: any) {
        errorPayments.value = error.message;
    } finally {
        loadingPayments.value = false;
    }
}

function selectPaymentMethod(payment: Payment) {
    selectedPayment.value = payment;
    setFieldValue('selectedPaymentId', payment.id); // Ensure the field value is set
    console.log('Selected payment method:', payment);
    console.log('Setting selectedPaymentId to:', payment.id);
    validate(); // Explicitly trigger validation for the form
    console.log('Debug - Form errors after selecting payment:', formErrors.value);
}

function getPaymentImageUrl(payment: Payment): string {
    return pb.files.getURL(payment, payment.icon);
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
            return null; // Or handle missing product
        }).filter(Boolean) as CartItem[]; // Filter out any nulls
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

function removeFromCart(productId: string) {
    cart.value = cart.value.filter(item => item.id !== productId);
    saveCartToSession();
}

function increaseQuantity(productId: string) {
    const existingItem = cart.value.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
        saveCartToSession();
    }
}

function decreaseQuantity(productId: string) {
    const existingItem = cart.value.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity--;
        saveCartToSession();
    } else if (existingItem && existingItem.quantity === 1) {
        removeFromCart(productId); // Remove item if quantity becomes 0
    }
}

const totalCartItems = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalCartPrice = computed(() => {
    return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

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
                    'key': RAJAONGKIR_API_KEY,
                    'Access-Control-Allow-Origin': '*',
                },
            };
            const response = await fetch(`${RAJAONGKIR_BASE_URL}/api/v1/destination/domestic-destination?search=${searchTerm}&limit=5&offset=0`, options);
            const responseData = await response.json();
            if (responseData && responseData.meta && responseData.meta.code === 200) {
                resultsRef.value = responseData.data.map((res: any) => ({
                    id: res.id.toString(),
                    name: res.label,
                    type: '',
                    province: res.province_name,
                    city_id: res.city_id || '',
                    subdistrict_id: res.subdistrict_id || '',
                }));
            } else {
                console.error(`${logPrefix} Error:`, responseData.meta ? responseData.meta.message : 'Invalid API response structure', responseData);
                resultsRef.value = [];
            }
        } catch (error) {
            console.error(`Error searching ${logPrefix.toLowerCase()}:`, error);
            resultsRef.value = [];
        }
    }, 500);
}

function searchRajaOngkirDestination() {
    searchRajaOngkir(searchDestination.value, destinationResults, 'Raja Ongkir Destination');
}

function selectDestination(dest: RajaOngkirDestination) {
    selectedDestination.value = dest;
    searchDestination.value = `${dest.name}, ${dest.province}`;
    destinationResults.value = [];
    shippingCosts.value = []; // Reset shipping cost when destination changes
    selectedShippingService.value = null; // Reset selected shipping service
}

function selectShippingService(cost: RajaOngkirCost) {
    selectedShippingService.value = cost
    setFieldValue('selectedShippingServiceCost', cost.cost); // Ensure the field value is set
    console.log('Selected shipping service:', cost);
    console.log('Setting selectedShippingServiceCost to:', cost.cost);
    validate(); // Explicitly trigger validation for the form
}

const grandTotal = computed(() => {
    return totalCartPrice.value + (selectedShippingService.value?.cost || 0);
});

// Removed searchRajaOngkirOrigin and selectOrigin as origin is no longer user editable

async function calculateShippingCost() {
    const totalWeight = cart.value.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

    if (!selectedOrigin.value?.id) {
        shippingCostError.value = 'Alamat asal belum diatur di pengaturan.';
        toast.error(shippingCostError.value);
        return;
    }

    if (!selectedDestination.value?.id || !selectedCourier.value || totalWeight === 0) {
        shippingCostError.value = 'Silakan pilih tujuan, kurir, dan pastikan ada produk di keranjang dengan berat.';
        toast.error(shippingCostError.value);
        return;
    }

    shippingCostLoading.value = true
    shippingCostError.value = null
    shippingCosts.value = []

    const originId = selectedOrigin.value.id;
    const destinationId = selectedDestination.value.id;

    // Log values before sending the request
    console.log('Sending shipping cost calculation request with:', { origin: originId, destination: destinationId, weight: totalWeight, courier: selectedCourier.value });

    try {
        const formData = new URLSearchParams();
        formData.append('origin', originId);
        formData.append('destination', destinationId);
        formData.append('weight', totalWeight.toString());
        formData.append('courier', selectedCourier.value);

        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'key': RAJAONGKIR_API_KEY,
                'Access-Control-Allow-Origin': '*',
            },
            body: formData.toString(),
        };
        const response = await fetch(`${RAJAONGKIR_BASE_URL}/api/v1/calculate/domestic-cost`, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json()

        if (data && data.meta && data.meta.code === 200) {
            shippingCosts.value = data.data || [];
            if (shippingCosts.value.length === 0) {
                shippingCostError.value = 'No shipping services found for the selected courier and destination.';
                toast.warning(shippingCostError.value);
            }
        } else {
            const errorMessage = data.meta?.message || 'Failed to calculate shipping cost. Check console for details.';
            console.error('Raja Ongkir Shipping Cost API Response (Error):', data);
            shippingCostError.value = errorMessage;
            toast.error(errorMessage);
        }
    } catch (error: any) {
        const errorMessage = 'Error calculating shipping cost: ' + (error?.message || 'Unknown error');
        shippingCostError.value = errorMessage;
        toast.error(errorMessage);
        console.error('Error calculating shipping cost:', error);
    } finally {
        shippingCostLoading.value = false;
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

async function proceedToPayment() {
    if (!authStore.isAuthenticated) {
        toast.error('Please log in to proceed with payment.');
        return;
    }

    if (processingPayment.value) {
        return; // Prevent double submission
    }
    processingPayment.value = true;

    if (!selectedPayment.value) {
        toast.error('Please select a payment method.');
        return;
    }

    if (!selectedShippingService.value?.service) {
        toast.error('Please calculate and select a shipping service.');
        return;
    }

    try {
        // Prepare order_details
        const orderDetails = {
            products: cart.value.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                weight: item.weight
            })),
            totalAmount: grandTotal.value,
            shippingCost: selectedShippingService.value.cost,
            shippingService: selectedShippingService.value.service,
            shippingEtd: selectedShippingService.value.etd,
            originAddress: selectedOrigin.value ? `${selectedOrigin.value.type} ${selectedOrigin.value.name}, ${selectedOrigin.value.province}` : 'N/A',
            destinationAddress: `${selectedDestination.value?.type} ${selectedDestination.value?.name}, ${selectedDestination.value?.province}`,
            totalWeight: cart.value.reduce((sum, item) => sum + (item.weight * item.quantity), 0),
        };

        const transactionData = {
            status: 'waiting for payment',
            payment: selectedPayment.value.id,
            order_details: JSON.stringify(orderDetails),
            ordered_by: authStore.currentUser?.value?.id,
            total_amount: grandTotal.value,
            shipping_cost: selectedShippingService.value?.cost,
            shipping_service: selectedShippingService.value?.service,
            shipping_etd: selectedShippingService.value?.etd,
            origin_address: selectedOrigin.value ? `${selectedOrigin.value.type} ${selectedOrigin.value.name}, ${selectedOrigin.value.province}` : 'N/A',
            destination_address: `${selectedDestination.value?.type} ${selectedDestination.value?.name}, ${selectedDestination.value?.province}`,
            total_weight: cart.value.reduce((sum, item) => sum + (item.weight * item.quantity), 0),
        };

        const record = await pb.collection('transaction').create(transactionData);
        toast.success('Transaction created successfully! Please upload your proof of payment.');
        console.log('Transaction created:', record);
        currentTransactionId.value = record.id; // Store the transaction ID

        // Clear cart after successful transaction creation
        cart.value = [];
        saveCartToSession();

        // Scroll to the proof upload section
        setTimeout(() => {
            const proofSection = document.getElementById('proof-of-payment-section');
            if (proofSection) {
                proofSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);

        // Redirect to order page after successful transaction creation
        router.push({ name: 'Order' });

    } catch (error: any) {
        console.error('Error creating transaction:', error);
        toast.error('Failed to create transaction: ' + error.message);
    } finally {
        processingPayment.value = false;
    }
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

        await pb.collection('transaction').update(currentTransactionId.value, formData);

        toast.success('Proof of payment uploaded successfully! Transaction status updated to "paid".');
        console.log('Proof uploaded and status updated for transaction:', currentTransactionId.value);

        // Reset after successful upload
        currentTransactionId.value = null;
        proofOfPaymentFile.value = null; // Reset the v-model, which will clear the FileUpload component

    } catch (error: any) {
        console.error('Error uploading proof of payment:', error);
        uploadProofError.value = 'Failed to upload proof: ' + error.message;
        toast.error('Upload Error', { description: 'Failed to upload proof: ' + error.message });
    } finally {
        uploadingProof.value = false;
    }
}

function onSubmit(values: any) { // `values` will contain validated form data for the current step
  if (stepIndex.value === steps.length) {
    // This function will be called when the last step is reached and the "Submit" button is clicked.
    // The actual payment logic is handled by proceedToPayment()
    console.log('Checkout process completed. Values:', values);
    proceedToPayment();
  }
}
const isNextButtonDisabled = computed(() => {
    const baseDisabled = !meta.value.valid;
    const cartEmpty = stepIndex.value === 1 && totalCartItems.value === 0;
    const shippingNotSelected = stepIndex.value === 2 && !selectedShippingService.value;
    return baseDisabled || cartEmpty || shippingNotSelected;
});
const isProceedToPaymentDisabled = computed(() => {
    return !meta.value.valid;
});
</script>
