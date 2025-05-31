// lib/pocketbase.ts
import PocketBase from 'pocketbase'

// Ganti dengan URL PocketBase server Anda
const pb = new PocketBase(import.meta.env.VITE_PB_URL)

// Interface untuk User
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  verified: boolean
  created: string
  updated: string
  roles?: string[]; // Optional roles field
}

// Interface for Product
export interface Product {
  id: string;
  name: string;
  desc: string;
  weight: number;
  price: number;
  image?: string; // Image will be a single URL string
}


// Callback type for auth store changes
type AuthStoreChangeCallback = (user: User | null) => void;

// Array to hold auth store change listeners
const authStoreChangeListeners: AuthStoreChangeCallback[] = [];

// Auth service
class AuthService {

  // Login user
  static async login(email: string, password: string): Promise<User> {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      // Explicitly map RecordModel to User interface
      const user: User = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        verified: authData.record.verified,
        created: authData.record.created,
        updated: authData.record.updated,
        roles: Array.isArray(authData.record.roles)
          ? (authData.record.roles as string[])
          : (authData.record.roles ? [authData.record.roles as string] : []),
      };
      return user;
    } catch (error) {
      throw new Error('Login gagal. Periksa email dan password Anda.')
    }
  }

  // Register user
  static async register(email: string, password: string, passwordConfirm: string, name?: string): Promise<User> {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name: name || email.split('@')[0]
      }

      const record = await pb.collection('users').create(userData)

      // Auto login setelah register
      await this.login(email, password)

      // Explicitly map RecordModel to User interface
      const user: User = {
        id: record.id,
        email: record.email,
        name: record.name,
        avatar: record.avatar,
        verified: record.verified,
        created: record.created,
        updated: record.updated,
        roles: Array.isArray(record.roles)
          ? (record.roles as string[])
          : (record.roles ? [record.roles as string] : []),

      };
      return user;
    } catch (error) {
      throw new Error('Registrasi gagal. Email mungkin sudah digunakan.')
    }
  }

  // Logout user
  static logout(): void {
    pb.authStore.clear()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return pb.authStore.isValid
  }

  // Get current user
  static getCurrentUser(): User | null {
    if (this.isAuthenticated() && pb.authStore.model) {
      // Explicitly map AuthRecord to User interface
      const user: User = {
        id: pb.authStore.model.id,
        email: pb.authStore.model.email,
        name: pb.authStore.model.name,
        avatar: pb.authStore.model.avatar,
        verified: pb.authStore.model.verified,
        created: pb.authStore.model.created,
        updated: pb.authStore.model.updated,
        roles: (() => {
          const modelRoles = (pb.authStore.model as any).roles;
          if (modelRoles) {
            if (Array.isArray(modelRoles)) {
              return modelRoles as string[];
            } else if (typeof modelRoles === 'string') {
              return [modelRoles];
            }
          }
          return [];
        })(),
      };
      return user;
    }
    return null
  }

  // Refresh auth token
  static async refreshAuth(): Promise<User> {
    try {
      const authData = await pb.collection('users').authRefresh();
      const user: User = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        verified: authData.record.verified,
        created: authData.record.created,
        updated: authData.record.updated,
        roles: Array.isArray(authData.record.roles)
          ? (authData.record.roles as string[])
          : (authData.record.roles ? [authData.record.roles as string] : []),
      };
      return user;
    } catch (error) {
      throw new Error('Failed to refresh authentication token.');
    }
  }

  // Send Verification email
  static async sendVerificationEmail(email: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated')
    }

    try {
      await pb.collection('users').requestVerification(email)
    } catch (error) {
      throw new Error('Gagal mengirim email verifikasi')
    }
  }

  // Method to subscribe to auth store changes
  static onAuthStoreChange(callback: AuthStoreChangeCallback): () => void {
    authStoreChangeListeners.push(callback);
    // Return an unsubscribe function
    return () => {
      const index = authStoreChangeListeners.indexOf(callback);
      if (index > -1) {
        authStoreChangeListeners.splice(index, 1);
      }
    };
  }
}

// Product service
class ProductService {
  static async getAllProducts(collectionName: string = 'products'): Promise<Product[]> {
    try {
      const records = await pb.collection(collectionName).getFullList({
        sort: '-created',
      });
      return records.map(record => ({
        id: record.id,
        name: record.name,
        desc: record.desc,
        weight: record.weight,
        price: record.price,
        image: (() => {
          let imageUrl = '';
          if (record.image) {
            if (Array.isArray(record.image) && record.image.length > 0) {
              imageUrl = pb.files.getURL(record, record.image[0]); // Use the first image if it's an array
            } else if (typeof record.image === 'string') {
              imageUrl = pb.files.getURL(record, record.image); // Use directly if it's a string
            }
          }
          return imageUrl;
        })(), // Construct full image URL, handling arrays
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products.');
    }
  }
}


// Listen for auth store changes
pb.authStore.onChange(() => {
  const currentUser = AuthService.getCurrentUser();
  authStoreChangeListeners.forEach(callback => callback(currentUser));
});

export { pb, AuthService, ProductService }
