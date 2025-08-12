import { useState, useEffect } from 'react';
import { getTransactionHistory, getGiftHistory } from '@/api/wallet/walletActions';
import { CONFIG } from '@/Constants/config';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status?: string;
  from?: string;
  to?: string;
  category?: string;
}

export interface Gift {
  id: string;
  amount: number;
  from: {
    username: string;
    profile_photo?: string;
  };
  to: {
    username: string;
    profile_photo?: string;
  };
  video?: {
    title: string;
  };
  comment?: {
    content: string;
  };
  createdAt: string;
  type: 'sent' | 'received';
}

export const useTransactionHistory = (token: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionHistory = async (page: number = 1, limit: number = 20) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getTransactionHistory(token, page, limit);
      console.log('📊 Transaction history response:', response);
      
      // Transform backend data to match our interface
      const transformedTransactions = response.transactions?.map((tx: any) => ({
        id: tx._id || tx.id,
        type: tx.type === 'credit' ? 'credit' : 'debit',
        amount: tx.amount,
        description: tx.description || tx.purpose || 'Transaction',
        date: tx.createdAt || tx.date,
        status: tx.status,
        from: tx.from,
        to: tx.to,
        category: tx.category,
      })) || [];
      
      setTransactions(transformedTransactions);
    } catch (err) {
      console.error('❌ Error fetching transaction history:', err);
      // Set empty array instead of error for better UX
      setTransactions([]);
      setError(null); // Don't show error, just show empty state
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wallet-specific transactions (deposits and withdrawals only)
  const fetchWalletTransactions = async (page: number = 1, limit: number = 20) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch wallet_load transactions (deposits)
      const walletLoadResponse = await fetch(`${CONFIG.API_BASE_URL}/wallet/transactions?category=wallet_load&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Fetch withdrawal_request transactions (withdrawals)
      const withdrawalResponse = await fetch(`${CONFIG.API_BASE_URL}/wallet/transactions?category=withdrawal_request&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const walletLoadData = walletLoadResponse.ok ? await walletLoadResponse.json() : { transactions: [] };
      const withdrawalData = withdrawalResponse.ok ? await withdrawalResponse.json() : { transactions: [] };

      console.log('💰 Wallet load transactions:', walletLoadData);
      console.log('💸 Withdrawal transactions:', withdrawalData);

      // Combine both types of transactions
      const allWalletTransactions = [
        ...(walletLoadData.transactions || []),
        ...(withdrawalData.transactions || [])
      ];

      // Transform and sort by date
      const transformedTransactions = allWalletTransactions
        .map((tx: any) => ({
          id: tx._id || tx.id,
          type: tx.type === 'credit' ? 'credit' : 'debit',
          amount: tx.amount,
          description: tx.description || tx.purpose || 'Transaction',
          date: tx.createdAt || tx.date,
          status: tx.status,
          from: tx.from,
          to: tx.to,
          category: tx.category,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('🔍 Final wallet transactions:', transformedTransactions);
      setTransactions(transformedTransactions);
    } catch (err) {
      console.error('❌ Error fetching wallet transactions:', err);
      setTransactions([]);
      setError(null); // Don't show error, just show empty state
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch spending history (all app purchases and spending)
  const fetchSpendingHistory = async (page: number = 1, limit: number = 20) => {
    await fetchTransactionHistory(page, limit);
  };

  const fetchGiftHistory = async (page: number = 1, limit: number = 20) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getGiftHistory(token, page, limit);
      console.log('🎁 Gift history response:', response);
      
      // Transform backend data to match our interface
      const transformedGifts = response.gifts?.map((gift: any) => ({
        id: gift._id || gift.id,
        amount: gift.amount,
        from: {
          username: gift.from?.username || 'Unknown',
          profile_photo: gift.from?.profile_photo,
        },
        to: {
          username: gift.to?.username || 'Unknown', 
          profile_photo: gift.to?.profile_photo,
        },
        video: gift.video ? {
          title: gift.video.title || gift.video.name,
        } : undefined,
        comment: gift.comment ? {
          content: gift.comment.content,
        } : undefined,
        createdAt: gift.createdAt,
        type: gift.type || 'received', // Determine if sent or received
      })) || [];
      
      setGifts(transformedGifts);
    } catch (err) {
      console.error('❌ Error fetching gift history:', err);
      // Set empty array instead of error for better UX
      setGifts([]);
      setError(null); // Don't show error, just show empty state
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions,
    gifts,
    isLoading,
    error,
    fetchTransactionHistory,
    fetchWalletTransactions,
    fetchSpendingHistory,
    fetchGiftHistory,
    clearError: () => setError(null),
  };
};