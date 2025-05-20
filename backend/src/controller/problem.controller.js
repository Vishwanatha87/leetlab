import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  //  get all the data from the request body
  // going to chek the user role, if the user is admin then create the problem
  // loop through the each and every reference soluton

  try {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
    } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "You are not authorized to create a problem",
        error: "You are not authorized to create a problem",
      });
    }

    for (const [language, solutonCode] of Object.entries(referenceSolutions)) {
      //object.entries() is used to loop through the object and get the key and value in a array
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          message: "Invalid language",
          error: `Language '${language}' is not supported.`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutonCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));
      console.log("Submissions", submissions);

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((result) => result.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("Result -------------------- " + result);

        if (result.status.id !== 3) {
          return res.status(400).json({
            message: "Test case failed",
            error: `Test case ${i + 1} failed with for ${language}`,
          });
        }
      }
    }

    // create the problem in the database

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      sucess: true,
      message: "Problem created successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Problem not created",
      error: error.message,
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      include: {
        problemSolvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });

    if (!problems) {
      res.status(404).json({
        success: false,
        message: "No problems found",
        error: "No problems found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "error fetching problems",
      error: error.message,
    });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
        error: "Problem not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error fetching problem by id",
      error: error.message,
    });
  }
};

export const updateProblemById = async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "You are not authorized to create a problem",
        error: "You are not authorized to create a problem",
      });
    }

    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
        error: "Problem not found",
      });
    }

    for (const [language, solutonCode] of Object.entries(referenceSolutions)) {
      //object.entries() is used to loop through the object and get the key and value in a array
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          message: "Invalid language",
          error: `Language '${language}' is not supported.`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutonCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));
      console.log("Submissions", submissions);

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((result) => result.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("Result -------------------- " + result);

        if (result.status.id !== 3) {
          return res.status(400).json({
            message: "Test case failed",
            error: `Test case ${i + 1} failed with for ${language}`,
          });
        }
      }
    }

    const updatedProblem = await db.problem.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
      },
    });

    return res.status(200).json({
      sucess: true,
      message: "Problem updates successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Problem not updated",
      error: error.message,
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
        error: "Problem not found",
      });
    }

    await db.problem.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error deleting problem",
      error: error.message,
    });
  }
};

export const getAllSolvedProblemsByUser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        problemSolvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        problemSolvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "error fetching problems",
      error: error.message,
    });
  }
};
