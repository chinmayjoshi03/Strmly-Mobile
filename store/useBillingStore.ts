import { create } from "zustand";
import {
  initConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  acknowledgePurchaseAndroid,
  getAvailablePurchases,
  Product,
  ProductPurchase,
} from "react-native-iap";
import Constants from "expo-constants";
import { useAuthStore } from "./useAuthStore";

export interface PurchaseConfig {
  productId: string;
  orderId: string;
  onVerify: (
    orderId: string,
    paymentId: string,
    signature: string
  ) => Promise<any>;
  onSuccess: () => void;
  onFailure: () => void;
}

interface BillingState {
  isConnected: boolean;
  products: Product[];
  isLoading: boolean;
  error: string | null;
  initBilling: () => Promise<void>;
  loadProducts: (productIds: string[]) => Promise<void>;
  purchaseProduct: (config: PurchaseConfig) => Promise<void>;
  handleSuccessfulPurchase: (purchase: ProductPurchase) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;
const { token } = useAuthStore();

const PRODUCT_PRICE_MAP: Record<string, number> = {
  wallet_100: 100,
  wallet_250: 250,
  wallet_500: 500,
  wallet_1000: 1000,
};

export const useBillingStore = create<BillingState>((set, get) => ({
  isConnected: false,
  products: [],
  isLoading: false,
  error: null,

  initBilling: async () => {
    try {
      set({ isLoading: true });
      await initConnection();
      set({ isConnected: true });
    } catch (error: any) {
      set({
        error: error.message || "Failed to initialize billing",
        isConnected: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadProducts: async (productIds) => {
    try {
      set({ isLoading: true });
      const products = await getProducts({ skus: productIds });
      set({ products });
    } catch (error: any) {
      set({ error: error.message || "Failed to load products" });
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseProduct: async ({
    productId,
    orderId,
    onVerify,
    onSuccess,
    onFailure,
  }: PurchaseConfig) => {
    try {
      set({ isLoading: true, error: null });

      const amount = PRODUCT_PRICE_MAP[productId];
      if (!amount) throw new Error("Invalid product ID");

      await fetch(`${BACKEND_API_URL}/wallet/load/create-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }), // ✅ send actual amount
      });

      await requestPurchase({ sku: productId });
    } catch (error: any) {
      set({ error: error.message || "Purchase failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  handleSuccessfulPurchase: async (purchase: ProductPurchase) => {
    try {
      set({ isLoading: true });

      const amount = PRODUCT_PRICE_MAP[purchase.productId];
      if (!amount) throw new Error("Invalid product ID");

      // 1. Verify purchase with Google (optional endpoint)
      const verification = await fetch(
        `${BACKEND_API_URL}/wallet/load/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            google_purchase_token: purchase.purchaseToken,
            google_product_id: purchase.productId,
            google_order_id: purchase.transactionId,
            amount, // ✅ send original amount
          }),
        }
      );

      if (!verification.ok) throw new Error("Wallet update failed");

      // 2. Acknowledge if needed
      if (purchase.isAcknowledgedAndroid === false) {
        await acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
      }

      // 3. Finish transaction
      await finishTransaction({ purchase, isConsumable: true });
    } catch (error: any) {
      set({ error: error.message || "Failed to process purchase" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  restorePurchases: async () => {
    try {
      set({ isLoading: true });
      const purchases = await getAvailablePurchases();
      for (const purchase of purchases) {
        await get().handleSuccessfulPurchase(purchase);
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to restore purchases" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
