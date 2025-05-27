import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set, get) => ({
  isLoading: false,
  submissions: [],
  submission: null,
  submissionCount: null,

  getAllSubmissions: async () => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get("/submission/get-all-submissions");

      set({
        submissions: res.data.submissions,
      });
      toast.success(res.data.message);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Failed to fetch submissions");
    }
    finally {
      set({ isLoading: false });
    }
  },

  getSubmissionForProblem: async (problemId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(`/submission/get-submission/${problemId}`);

      set({
        submission: res.data.submission,
      });
      toast.success(res.data.message);
    } catch (error) {
        console.error("Error fetching submission for problem:", error);
        toast.error("Failed to fetch submission for problem");
    }
    finally {
      set({ isLoading: false });
    }
  },

    getSubmissionCountForProblem: async (problemId) => {
        try {
        set({ isLoading: true });
        const res = await axiosInstance.get(`/submission/get-submission-count/${problemId}`);
    
        set({
            submissionCount: res.data.count,
        });
        toast.success(res.data.message);
        } catch (error) {
            console.error("Error fetching submission count for problem:", error);
            toast.error("Failed to fetch submission count for problem");
        }
        finally {
        set({ isLoading: false });
        }
    },
}));
