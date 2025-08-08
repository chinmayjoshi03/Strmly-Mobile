import { CONFIG } from '@/Constants/config';

export interface LikeResponse {
  message: string;
  likes: number;
  isLiked: boolean;
}

export interface ShareResponse {
  message: string;
  shares: number;
}

export interface LikeStatusResponse {
  message: string;
  isLiked: boolean;
  likes: number;
}

export class VideoInteractionsAPI {
  private static getHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Toggle like status for a video
  static async likeVideo(
    token: string,
    videoId: string
  ): Promise<LikeResponse> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/interactions/like`,
      {
        method: 'POST',
        headers: VideoInteractionsAPI.getHeaders(token),
        body: JSON.stringify({
          videoId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to like video: ${response.status}`);
    }

    return response.json();
  }

  // Share a video
  static async shareVideo(
    token: string,
    videoId: string
  ): Promise<ShareResponse> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/interactions/share`,
      {
        method: 'POST',
        headers: VideoInteractionsAPI.getHeaders(token),
        body: JSON.stringify({
          videoId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to share video: ${response.status}`);
    }

    return response.json();
  }

  // Get like status for a video
  static async getLikeStatus(
    token: string,
    videoId: string
  ): Promise<LikeStatusResponse> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/interactions/like/status`,
      {
        method: 'POST',
        headers: VideoInteractionsAPI.getHeaders(token),
        body: JSON.stringify({
          videoId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get like status: ${response.status}`);
    }

    return response.json();
  }

  // Get total shares for a video
  static async getTotalShares(
    token: string,
    videoId: string
  ): Promise<{success: boolean; message: string; totalShares: number}> {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/interactions/shares/${videoId}`,
      {
        method: 'GET',
        headers: VideoInteractionsAPI.getHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get total shares: ${response.status}`);
    }

    return response.json();
  }
}