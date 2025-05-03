import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
// this is the part which handles the code execution

try {
    const {source_code, language_id, stdin, expected_outputs, problemId} =req.body;

    const userId = req.user.id;

    // validate the test cases
    if(
        !Array.isArray(stdin) || stdin.length === 0 ||
        !Array.isArray(expected_outputs) || expected_outputs.length!=stdin.length
    ){
        return res.status(400).json({
            message: "Invalid or missing test cases",
            error: "Invalid or missing test cases",
        });
    }


    // 2. prepare each test case for batch submission

    const submissions = stdin.map((input)=>({
        source_code,
        language_id,
        stdin: input
    }))

    // 3. submit the test cases to judge

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((result) => result.token);
    console.log("Tokens", tokens);

    // 4. poll the results for each test case
    const results = await pollBatchResults(tokens);

    console.log("Results--------------", results);

    


    res.status(200).json({
        message:"code executed successfully"
    })

} catch (error) {
    
}

}