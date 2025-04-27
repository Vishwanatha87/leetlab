import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults } from "../libs/judge0.lib.js";

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

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((result) => result.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            message: "Test case failed",
            error: `Test case ${i + 1} failed with status ${language}`,
          });
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
        message: "Problem created successfully",
        problem: newProblem,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Problem not created",
      error: error.message,
    });
  }
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblemById = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllSolvedProblemsByUser = async (req, res) => {};
