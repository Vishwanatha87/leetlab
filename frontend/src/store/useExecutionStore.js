import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useExecutionStore = create((set) => ({
  isExecuting: false,
  submission: null,

  executeCode: async (
    source_code,
    language_id,
    stdin,
    expected_outputs,
    problemId
  ) => {
    try {
      set({ isExecuting: true });
      console.log(JSON.stringify({ source_code, language_id, stdin, expected_outputs, problemId }));

      const res = await axiosInstance.post("/execute-code", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId,
      });

      set({ submission: res.data.submission });
      toast.success(res.data.message);
    } catch (error) {
      console.log("error executing code", error);
      toast.error("Error executing code", error.message);
    }
    finally {
      set({ isExecuting: false });
    }
  },

}));
