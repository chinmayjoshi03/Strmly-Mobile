import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type creator = {
  _id: string;
  username: string;
  name?: string;
  profile_photo: string;
};

type series = {
  _id: string;
  title: string;
  type: string;
  price: number;
} | null;

type GiftingState = {
  isGifted: boolean;
  isPurchasedPass: boolean;
  isPurchasedSeries: boolean;
  isPurchasedCommunityPass: boolean;
  giftSuccessMessage: number | null;
  hasFetched: boolean;
  creator: creator | null;
  series: {} | null;
  videoId: string | null;
  initiateGifting: (creator: creator, videoId: string) => Promise<void>;
  initiateCreatorPass: (creator: creator) => Promise<void>;
  initiateCommunityPass: (creator: creator) => Promise<void>;
  initiateSeries: (series: {} | null) => Promise<void>;
  loadGiftingContext: () => Promise<void>;
  fetchGiftingData: () => Promise<void>;
  completeGifting: (amount: number) => Promise<void>;
  completePass: (amount: number) => Promise<void>;
  completeCommunityPass: (amount: number) => Promise<void>;
  completeSeriesPurchasing: ()=> void;
  clearGiftingData: () => void;
  clearPassData: () => void;
  clearSeriesData: () => void;
  clearCommunityPassData: () => void;
};

export const useGiftingStore = create<GiftingState>((set) => ({
  isGifted: false,
  isPurchasedPass: false,
  isPurchasedSeries: false,
  isPurchasedCommunityPass: false,
  giftSuccessMessage: null,
  hasFetched: false,
  creator: null,
  series: null,
  videoId: null,

  initiateGifting: (creator, videoId) => {
    set({
      creator,
      videoId,
      hasFetched: false,
      isGifted: false,
      giftSuccessMessage: null,
    });
  },

  initiateCreatorPass: (creator) => {
    set({
      creator,
      hasFetched: false,
      isPurchasedPass: false,
      giftSuccessMessage: null,
    });
  },

  initiateCommunityPass: (creator) => {
    set({
      creator,
      hasFetched: false,
      isPurchasedPass: false,
      giftSuccessMessage: null,
    });
  },

  initiateSeries: (series: series) => {
    set({
      series,
      hasFetched: false,
      isPurchasedSeries: false,
    });
  },

  completeGifting: (amount) => {
    set({
      giftSuccessMessage: amount,
      isGifted: true,
      hasFetched: true,
    });
  },

  completePass: (amount) => {
    set({
      giftSuccessMessage: amount,
      isPurchasedPass: true,
      hasFetched: true,
    });
  },

  completeCommunityPass: (amount) => {
    set({
      giftSuccessMessage: amount,
      isPurchasedCommunityPass: true,
      hasFetched: true,
    });
  },

  completeSeriesPurchasing: () => {
    set({
      isPurchasedSeries: true,
      hasFetched: true,
    });
  },

  clearGiftingData: () => {
    set({
      isGifted: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null,
      videoId: null,
    });
  },

  clearPassData: () => {
    set({
      isPurchasedPass: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null
    });
  },

  clearCommunityPassData: () => {
    set({
      isPurchasedCommunityPass: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null
    });
  },

  clearSeriesData: () => {
    set({
      isPurchasedSeries: false,
      hasFetched: false,
      creator: null,
      series: null,
    });
  },
}));
