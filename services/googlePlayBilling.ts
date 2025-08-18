// Google Play Billing Service
// This service handles all Google Play Billing operations
import {
  endConnection,
  getProducts,
  initConnection,
  requestPurchase,
} from "react-native-iap";

export interface BillingProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
}

export interface PurchaseResult {
  orderId: string;
  purchaseToken: string;
  signature: string;
  productId: string;
  transactionDate: number;
}

// Predefined wallet recharge products
export const WALLET_PRODUCTS = [
  { productId: "add_money_to_wallet_10", amount: 10, price: "₹10" },
  { productId: "add_money_to_wallet_50", amount: 50, price: "₹50" },
  { productId: "add_money_to_wallet_100", amount: 100, price: "₹100" },
  { productId: "add_money_to_wallet_200", amount: 200, price: "₹200" },
  { productId: "add_money_to_wallet_500", amount: 500, price: "₹500" },
];

class GooglePlayBillingService {
  private isInitialized = false;

  // Initialize Google Play Billing
  async initialize(): Promise<void> {
    try {
      await initConnection();

      this.isInitialized = true;
      console.log("Google Play Billing initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Google Play Billing:", error);
      throw new Error("Failed to initialize Google Play Billing");
    }
  }

  // Get available products
  async getProducts(): Promise<BillingProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const products = await getProducts({
        skus: WALLET_PRODUCTS.map((p) => p.productId),
      });
      return products;
    } catch (error) {
      console.error("Failed to get products:", error);
      throw new Error("Failed to get billing products");
    }
  }

  // Purchase a product
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`Initiating purchase for product: ${productId}`);

      const purchaseResult = await requestPurchase({ sku: productId });

      let purchase: any;
      if (Array.isArray(purchaseResult)) {
        purchase = purchaseResult[0];
      } else if (purchaseResult && typeof purchaseResult === "object") {
        purchase = purchaseResult;
      } else {
        throw new Error("No purchase result returned");
      }

      return {
        orderId: purchase.orderId,
        purchaseToken: purchase.purchaseToken,
        signature: purchase.signature,
        productId: purchase.productId,
        transactionDate: purchase.transactionDate,
      };
    } catch (error) {
      console.error("Purchase failed:", error);
      throw new Error("Purchase failed");
    }
  }

  // Get product ID for amount
  getProductIdForAmount(amount: number): string {
    console.log(`Getting product ID for amount: ${amount}`);
    const product = WALLET_PRODUCTS.find((p) => p.amount === amount);
    console.log(`Found product:`, product);
    return product ? product.productId : `wallet_recharge_${amount}`;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      await endConnection();
      this.isInitialized = false;
      console.log("Google Play Billing connection closed");
    } catch (error) {
      console.error("Failed to cleanup Google Play Billing:", error);
    }
  }
}

// Export singleton instance
export const googlePlayBillingService = new GooglePlayBillingService();

// Installation instructions for actual implementation:
/*
To implement actual Google Play Billing, follow these steps:

1. Install react-native-iap:
   npm install react-native-iap

2. For React Native 0.60+, run:
   cd ios && pod install

3. Add products to Google Play Console:
   - Go to Google Play Console
   - Navigate to your app > Monetize > Products > In-app products
   - Create products with IDs matching WALLET_PRODUCTS

4. Replace mock implementations with actual react-native-iap calls:
   import {
     initConnection,
     endConnection,
     getProducts,
     requestPurchase,
     purchaseUpdatedListener,
     purchaseErrorListener,
   } from 'react-native-iap';

5. Handle purchase listeners in your app's root component:
   useEffect(() => {
     const purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
       // Handle successful purchase
     });

     const purchaseErrorSubscription = purchaseErrorListener((error) => {
       // Handle purchase error
     });

     return () => {
       purchaseUpdateSubscription?.remove();
       purchaseErrorSubscription?.remove();
     };
   }, []);
*/
