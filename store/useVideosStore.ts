import { VideoItemType } from "@/types/VideosType";
import { create } from "zustand";

interface VideosState {
  storedVideos: VideoItemType[];
  setVideosInZustand: (videos: VideoItemType[]) => void;
  appendVideos: (videos: VideoItemType[]) => void;
  clearVideos: () => void;
}

export const useVideosStore = create<VideosState>((set) => ({
  storedVideos: [],

  setVideosInZustand: (videos) =>
    set(() => ({
      storedVideos: [...videos], // replaces old data with new
    })),

  appendVideos: (videos) =>
    set((state) => ({
      storedVideos: [...state.storedVideos, ...videos],
    })),

  clearVideos: () => set({ storedVideos: [] }),
}));
