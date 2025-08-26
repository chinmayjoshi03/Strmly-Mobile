import { useState, useCallback } from "react";
import { UploadFlowState, VideoFormData, FinalStageData } from "../types";
import { Series } from "../../studio/types";
import { CONFIG } from "../../../Constants/config";

// Interface for draft data
interface DraftData {
  draftId?: string;
  name: string;
  description: string;
  genre: string;
  type: string;
  language: string;
  age_restriction: boolean;
  contentType: string;
  start_time?: number;
  display_till_time?: number;
  communityId?: string;
  seriesId?: string;
  amount?: number;
}

// Helper function to map community names to IDs
// You may need to adjust this based on your actual community data structure
const getCommunityIdFromName = (communityName: string): string | null => {
  const communityMap: Record<string, string> = {
    Tech: "tech_community_id",
    Gaming: "gaming_community_id",
    Music: "music_community_id",
    Sports: "sports_community_id",
    // Add more mappings as needed
  };
  return communityMap[communityName] || null;
};

/**
 * Upload Flow State Management Hook
 * Manages the entire upload flow state and navigation
 */

const initialVideoDetails: VideoFormData = {
  title: "",
  community: null,
  format: null,
  videoType: null,
  amount: undefined,
};

const initialFinalStageData: FinalStageData = {
  genre: null,
  autoplayStartMinutes: 0,
  autoplayStartSeconds: 22,
  unlockFromMinutes: 0,
  unlockFromSeconds: 22,
};

export const useUploadFlow = () => {
  const [state, setState] = useState<UploadFlowState>({
    currentStep: "format-select", // Start with format selection instead of file selection
    uploadProgress: 0,
    videoDetails: initialVideoDetails,
    finalStageData: initialFinalStageData,
    selectedFile: null,
    videoFormat: null,
    selectedSeries: null,
    isUploading: false,
    errors: {},
    draftId: null,
    isEditingDraft: false,
  });

  // Start the upload process
  const startUpload = useCallback(() => {
    console.log("Starting upload process...");
  }, []);

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    setState((prev) => {
      let nextStep = prev.currentStep;

      switch (prev.currentStep) {
        case "format-select":
          nextStep =
            prev.videoFormat === "episode" ? "episode-selection" : "details-1";
          break;
        case "episode-selection":
          nextStep = "details-1";
          break;
        case "series-selection":
          nextStep = "series-creation";
          break;
        case "series-creation":
          nextStep = "details-1";
          break;
        case "details-1":
          nextStep = "details-2";
          break;
        case "details-2":
          nextStep = "details-3";
          break;
        case "details-3":
          nextStep = "final";
          break;
        case "final":
          nextStep = "file-select"; // File selection is now the last step
          break;
        case "file-select":
          nextStep = "progress";
          break;
        case "progress":
          break;
      }

      return { ...prev, currentStep: nextStep };
    });
  }, []);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      let prevStep = prev.currentStep;

      switch (prev.currentStep) {
        case "episode-selection":
          prevStep = "format-select";
          break;
        case "series-selection":
          prevStep = "episode-selection";
          break;
        case "series-creation":
          prevStep = "series-selection";
          break;
        case "details-1":
          if (prev.videoFormat === "episode") {
            // For episodes, check if we have a selected series
            prevStep = prev.selectedSeries
              ? "episode-selection"
              : "format-select";
          } else {
            prevStep = "format-select";
          }
          break;
        case "details-2":
          prevStep = "details-1";
          break;
        case "details-3":
          prevStep = "details-2";
          break;
        case "final":
          prevStep = "details-3";
          break;
        case "file-select":
          // When editing draft, go back to final step to allow editing metadata
          // When creating new video, this should not happen as file-select is last
          prevStep = prev.isEditingDraft ? "final" : "final";
          break;
      }

      return { ...prev, currentStep: prevStep };
    });
  }, []);

  // Update video details
  const updateVideoDetails = useCallback((details: Partial<VideoFormData>) => {
    setState((prev) => ({
      ...prev,
      videoDetails: { ...prev.videoDetails, ...details },
    }));
  }, []);

  // Update final stage data
  const updateFinalStageData = useCallback((data: Partial<FinalStageData>) => {
    setState((prev) => ({
      ...prev,
      finalStageData: { ...prev.finalStageData, ...data },
    }));
  }, []);

  // Set selected file
  const setSelectedFile = useCallback((file: any) => {
    setState((prev) => ({
      ...prev,
      selectedFile: file,
    }));
  }, []);

  // Set video format
  const setVideoFormat = useCallback((format: "episode" | "single") => {
    setState((prev) => ({
      ...prev,
      videoFormat: format,
    }));
  }, []);

  // Set selected series
  const setSelectedSeries = useCallback((series: Series) => {
    setState((prev) => ({
      ...prev,
      selectedSeries: series,
    }));
  }, []);

  // Initialize from existing draft
  const initializeFromDraft = useCallback((draftData: any) => {
    console.log("🔄 Initializing from draft data:", draftData);

    // Map the draft data to the correct format
    const mappedVideoDetails = {
      title: draftData.name || "",
      community: draftData.community?.name || null,
      format: draftData.format || null,
      videoType: draftData.type?.toLowerCase() || null,
    };

    const mappedFinalStageData = {
      genre: draftData.genre || null,
      autoplayStartMinutes: Math.floor((draftData.start_time || 0) / 60),
      autoplayStartSeconds: (draftData.start_time || 0) % 60,
      unlockFromMinutes: Math.floor((draftData.display_till_time || 0) / 60),
      unlockFromSeconds: (draftData.display_till_time || 0) % 60,
    };

    console.log("📋 Mapped video details:", mappedVideoDetails);
    console.log("📋 Mapped final stage data:", mappedFinalStageData);

    setState((prev) => ({
      ...prev,
      draftId: draftData.id,
      isEditingDraft: true,
      currentStep: "file-select", // Start from file selection when editing draft
      videoDetails: mappedVideoDetails,
      finalStageData: mappedFinalStageData,
      videoFormat: draftData.series ? "episode" : "single",
      selectedSeries: draftData.series || null, // Set selected series if exists
    }));
  }, []);

  // Save to draft (metadata only)
  const saveToDraft = useCallback(async () => {
    try {
      console.log("💾 Starting saveToDraft with state:", {
        videoDetails: state.videoDetails,
        finalStageData: state.finalStageData,
        draftId: state.draftId,
        isEditingDraft: state.isEditingDraft,
      });

      const { token } = require("@/store/useAuthStore").useAuthStore.getState();

      if (!token) {
        throw new Error("Authentication required");
      }

      const draftData: DraftData = {
        ...(state.draftId && { draftId: state.draftId }), // Include draftId for updates
        name: state.videoDetails.title || "Untitled Video",
        description: state.videoDetails.title || "No description",
        genre: state.finalStageData.genre || "Action",
        type: state.videoDetails.videoType === "paid" ? "Paid" : "Free",
        language: "english",
        age_restriction: false,
        contentType: "video",
        start_time:
          state.finalStageData.autoplayStartMinutes * 60 +
          state.finalStageData.autoplayStartSeconds,
        display_till_time:
          state.finalStageData.unlockFromMinutes * 60 +
          state.finalStageData.unlockFromSeconds,
      };

      // Always include amount for paid videos
      if (state.videoDetails.videoType === "paid") {
        if (!state.videoDetails.amount || state.videoDetails.amount <= 0) {
          throw new Error(
            "Please enter a valid price for paid videos (must be greater than 0)"
          );
        }
        draftData.amount = state.videoDetails.amount;
        console.log("💰 Setting amount for paid video:", draftData.amount);
      }

      console.log("📋 Draft data to be sent:", draftData);
      console.log("💰 Video details amount:", state.videoDetails.amount);
      console.log("🎬 Video type:", state.videoDetails.videoType);
      console.log(
        "🔍 Full video details:",
        JSON.stringify(state.videoDetails, null, 2)
      );

      // Add community if selected
      if (state.videoDetails.community) {
        const communityId = getCommunityIdFromName(
          state.videoDetails.community
        );
        if (communityId) {
          draftData.communityId = communityId;
        }
      }

      // Add series ID for episodes
      if (state.videoFormat === "episode" && state.selectedSeries) {
        draftData.seriesId = state.selectedSeries.id;
      }

      console.log("💾 Saving draft with data:", draftData);

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/drafts/create-or-update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save draft");
      }

      const result = await response.json();
      console.log("✅ Draft saved successfully:", result);

      // Update state with draft ID and navigate back to file selection
      setState((prev) => ({
        ...prev,
        draftId: result.draft.id,
        isEditingDraft: true,
        currentStep: "file-select", // Navigate back to file selection
        selectedFile: null, // Clear selected file so user can select again
      }));

      return result.draft;
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  }, [state]);

  // Go directly to details step
  const goToDetailsStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: "details-1",
    }));
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const {
      currentStep,
      videoDetails,
      finalStageData,
      selectedFile,
      videoFormat,
      selectedSeries,
    } = state;

    switch (currentStep) {
      case "format-select":
        return videoFormat !== null;
      case "series-selection":
        return selectedSeries !== null;
      case "series-creation":
        return true;
      case "details-1":
        return (
          videoDetails.title.trim() !== "" && videoDetails.community !== null
        );
      case "details-2":
        return (
          videoDetails.title.trim() !== "" &&
          videoDetails.community !== null &&
          videoDetails.format !== null
        );
      case "details-3":
        return (
          videoDetails.title.trim() !== "" &&
          videoDetails.community !== null &&
          videoDetails.format !== null &&
          videoDetails.videoType !== null
        );
      case "final":
        return finalStageData.genre !== null;
      case "file-select":
        return selectedFile !== null;
      default:
        return true;
    }
  }, [state]);

  // Submit final upload using Draft API flow
  const submitUpload = useCallback(async () => {
    if (!state.selectedFile) {
      console.error("No selected file for upload");
      return false;
    }

    setState((prev) => ({
      ...prev,
      currentStep: "progress",
      uploadProgress: 0,
      isUploading: true,
      errors: {},
    }));

    try {
      const { token } = require("@/store/useAuthStore").useAuthStore.getState();
      if (!token) {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          errors: { upload: "Authentication required" },
        }));
        return false;
      }

      const directUploadFormData = new FormData();
      directUploadFormData.append("videoFile", {
        uri: state.selectedFile.uri,
        type: state.selectedFile.type || "video/mp4",
        name: state.selectedFile.name || "video.mp4",
      } as any);

      // Add metadata
      directUploadFormData.append(
        "name",
        state.videoDetails.title || "Untitled Video"
      );
      directUploadFormData.append(
        "description",
        state.videoDetails.description || "No description"
      );
      directUploadFormData.append(
        "genre",
        state.finalStageData.genre || "Action"
      );
      directUploadFormData.append(
        "type",
        state.videoDetails.videoType === "paid" ? "Paid" : "Free"
      );
      directUploadFormData.append("language", "english");
      directUploadFormData.append("age_restriction", "false");
      directUploadFormData.append(
        "start_time",
        (
          state.finalStageData.autoplayStartMinutes * 60 +
          state.finalStageData.autoplayStartSeconds
        ).toString()
      );
      directUploadFormData.append(
        "display_till_time",
        (
          state.finalStageData.unlockFromMinutes * 60 +
          state.finalStageData.unlockFromSeconds
        ).toString()
      );
      directUploadFormData.append(
        "is_standalone",
        state.videoFormat === "single" ? "true" : "false"
      );

      if (state.videoDetails.videoType === "paid") {
        directUploadFormData.append(
          "amount",
          state.videoDetails.amount.toString()
        );
      }
     
      if (
        state.videoDetails.community &&
        state.videoDetails.community !== "none"
      ) {
        directUploadFormData.append(
          "communityId",
          state.videoDetails.community
        );
      }
      if (state.videoFormat === "episode" && state.selectedSeries) {
        directUploadFormData.append("seriesId", state.selectedSeries.id);
        directUploadFormData.append("episodeNumber", "1");
      }

      console.log("Direct Upload Form Data:", directUploadFormData);
      // 🚀 Use XMLHttpRequest for upload with progress
      const uploadPromise = new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", `${CONFIG.API_BASE_URL}/videos/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        // Track progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(
              100,
              Math.round((event.loaded / event.total) * 100)
            );
            setState((prev) => ({ ...prev, uploadProgress: percent }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("✅ Upload success:", response);
              setState((prev) => ({
                ...prev,
                uploadProgress: 100,
                isUploading: false,
              }));
              resolve(true);
            } catch (err) {
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.send(directUploadFormData);
      });

      return await uploadPromise;
    } catch (error) {
      console.error("Upload error:", error);
      setState((prev) => ({
        ...prev,
        isUploading: false,
        errors: { upload: error.message || "Upload failed" },
      }));
      return false;
    }
  }, [state]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setState({
      currentStep: "format-select",
      uploadProgress: 0,
      videoDetails: initialVideoDetails,
      finalStageData: initialFinalStageData,
      selectedFile: null,
      videoFormat: null,
      selectedSeries: null,
      isUploading: false,
      errors: {},
      draftId: null,
      isEditingDraft: false,
    });
  }, []);

  return {
    state,
    startUpload,
    goToNextStep,
    goToPreviousStep,
    goToDetailsStep,
    updateVideoDetails,
    updateFinalStageData,
    setSelectedFile,
    setVideoFormat,
    setSelectedSeries,
    validateCurrentStep,
    submitUpload,
    resetFlow,
    initializeFromDraft,
    saveToDraft,
  };
};