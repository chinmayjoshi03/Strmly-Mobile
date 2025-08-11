import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type creator = {
  _id: string;
  username: string;
  name?: string;
  profile_photo: string;
};

type GiftingState = {
  isGifted: boolean;
  giftSuccessMessage: number | null;
  hasFetched: boolean;
  creator: creator | null;
  videoId: string | null;
  initiateGifting: (creator: creator, videoId: string) => Promise<void>;
  loadGiftingContext: () => Promise<void>;
  fetchGiftingData: () => Promise<void>;
  completeGifting: (amount: number) => Promise<void>;
  clearGiftingData: () => void;
};

export const useGiftingStore = create<GiftingState>((set) => ({
  isGifted: false,
  giftSuccessMessage: null,
  hasFetched: false,
  creator: null,
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

  completeGifting: (amount) => {
    set({
      giftSuccessMessage: amount,
      isGifted: true,
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
}));
