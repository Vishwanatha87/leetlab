import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProblemStore = create((set) => ({
  problems: [],
  problem: {},
  solvedProblems: [],
  isProblemsLoading: false,
  isProblemLoading: false,

  getAllProblems: async () => {
    try {
      set({ isProblemsLoading: true });

      const res = await axiosInstance.get("/problem/get-all-problems");

      set({ problems: res.data.problems });
    } catch (error) {
      console.log("error getting problems", error);
      toast.error("Error getting problems", error.message);
    } finally {
      set({ isProblemsLoading: false });
    }
  },
  getProblemById: async (id) => {
    try {
      set({ isProblemLoading: true });
      const res = await axiosInstance.get(`/problem/get-problem/${id}`);
      set({ problem: res.data.problem });
      toast.success(res.data.message);
      console.log(res.data.problem);
    } catch (error) {
      console.log("error getting problem", error);
      toast.error("Error getting problem", error.message);
    } finally {
      set({ isProblemLoading: false });
    }
  },
  getSolvedProblemByUser: async () => {
    try {
      set({ isProblemsLoading: true });
      const res = await axiosInstance.get("/problem/get-solved-problems");
      set({ solvedProblems: res.data.solvedProblems });
      toast.success(res.data.message);
    } catch (error) {
      console.log("error getting solved problems", error);
      toast.error("Error getting solved problems", error.message);
    } finally {
      set({ isProblemsLoading: false });
    }
  },
}));
