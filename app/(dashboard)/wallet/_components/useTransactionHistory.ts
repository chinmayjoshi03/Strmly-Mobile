import { useState, useEffect } from 'react';
import { getTransactionHistory, getGiftHistory } from '@/api/wallet/walletActions';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status?: string;
  from?: string;
  to?: string;
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
    fetchGiftHistory,
    clearError: () => setError(null),
  };
};