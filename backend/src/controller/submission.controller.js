export const getAllSubmissions = async (req, res) => {
  try {
    const userID = req.user.id;
    // check user id

    const submissions = await db.Submission.findMany({
      where: {
        userId: userID,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      data: submissions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "error fetching submissions",
      error: error.message,
    });
  }
};

export const getSubmissionForProblem = async (req, res) => {
  try {
    const userID = req.user.id;

    const { problemId } = req.params.problemId;

    const submissions = await db.Submission.findMany({
      where: {
        userId: userID,
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      data: submissions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "error fetching submission",
      error: error.message,
    });
  }
};

export const getSubmissionCountForProblem = async (req, res) => {
  try {
    const userID = req.user.id;

    const { problemId } = req.params.problemId;

    const submissionCount = await db.Submission.count({
      where: {
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submission count fetched successfully",
      data: submissionCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "error fetching submission count",
      error: error.message,
    });
  }
};
