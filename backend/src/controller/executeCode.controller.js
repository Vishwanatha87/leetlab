import { db } from "../libs/db.js";
import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
  // this is the part which handles the code execution

  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    const userId = req.user.id;

    // validate the test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length != stdin.length
    ) {
      return res.status(400).json({
        message: "Invalid or missing test cases",
        error: "Invalid or missing test cases",
      });
    }

    // 2. prepare each test case for batch submission

    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // 3. submit the test cases to judge

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((result) => result.token);
    console.log("Tokens", tokens);

    // 4. poll the results for each test case
    const results = await pollBatchResults(tokens);

    console.log("Results--------------", results);

    // analyze the test case results
    let allPassed = true;

    const detailedResult = results.map((result, index) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[index]?.trim();
      const passed = stdout === expected_output;

      if (!passed) {
        allPassed = false;
      }

      return {
        testcase: index + 1,
        passed,
        stdout,
        expectedOutput: expected_output,
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        time: result.time ? `${result.time} sec` : undefined,
        memory: result.memory ? `${result.memory} KB` : undefined,
      };

      //   console.log(`Testcase ${index + 1}`);
      //   console.log(`Input : ${stdin[index]}`);
      //   console.log(`Output : ${stdout}`);
      //   console.log(`Expected Output : ${expected_output}`);
      //   console.log(`Matched : ${passed}`);
    });

    console.log("Detailed Result", detailedResult);

    // store submission summary in the database

    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResult.map((r) => r.stdout)),
        stderr: detailedResult.some((r) => r.stderr)
          ? JSON.stringify(detailedResult.map((r) => r.stderr))
          : null,
        compileOutput: detailedResult.some((r) => r.compileOutput)
          ? JSON.stringify(detailedResult.map((r) => r.compileOutput))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResult.some((r) => r.memory)
          ? JSON.stringify(detailedResult.map((r) => r.memory))
          : null,
        time: detailedResult.some((r) => r.time)
          ? JSON.stringify(detailedResult.map((r) => r.time))
          : null,
      },
    });

    // if all passed is true then marked problem as solved for current user
    if (allPassed) {
      await db.ProblemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // individual test case result
    const testcaseResults = detailedResult.map((result, index) => ({
      submissionId: submission.id,
      testcase: result.testcase,
      passed: result.passed,
      stdout: result.stdout,
      expectedOutput: result.expectedOutput,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: result.status,
      time: result.time,
      memory: result.memory,
    }));

    // console.log("Testcase Results", testcaseResults);

    await db.TestCaseResult.createMany({
      data: testcaseResults,
    });
    
    

    // console.log("testing");
    
    const submissionWithTestcases = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testcases: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "code executed successfully",
      submission: submissionWithTestcases,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
