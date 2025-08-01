import { useEffect, useState } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";

export function useThumbnailsGenerate(videos: { id: string; url: string }[]) {
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const generateThumbnail = async (videoUrl: string, videoId: string) => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
          time: 5000, // 5 seconds
        });
        setThumbnails((prev) => ({ ...prev, [videoId]: uri }));
      } catch (e) {
        console.warn(`Failed to generate thumbnail for ${videoId}`, e);
      }
    };

    videos.forEach((vid) => {
      if (!thumbnails[vid.id]) {
        generateThumbnail(vid.url, vid.id);
      }
    });
  }, [videos]);

  return thumbnails;
}