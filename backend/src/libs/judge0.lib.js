import axios from "axios";

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    JAVASCRIPT: 63,
    PYTHON: 71,
    JAVA: 62,
    C: 50,
    CPP: 54,
  };

  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // console.log(data);
  return data;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const pollBatchResults = async (tokens) => {

    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {

            params: {
                tokens: tokens.join(","),
                base64_encoded: false,
            },
            headers: {
                "Content-Type": "application/json",
            },

        })

        const results = data.submissions;
        console.log("Results", results)

        const isAlldone = results.every((result) => {
            return result.status.id!==1 && result.status.id!==2
        })

        if(isAlldone){
            return results;
        }
        await sleep(1000)


    }
};


export const getLanguageName = (languageId) => {
  const languageMap = {
    63: "JavaScript",
    71: "Python",
    62: "Java",
    50: "C",
    54: "C++",
  };

  return languageMap[languageId] || "Unknown Language";
}
