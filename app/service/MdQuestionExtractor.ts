class MdQuestionExtractor {
    public parseQuestionDetails = (questionFile: string) => {
        const questionTableString = questionFile.split("---")[1];
        let questionID = questionTableString.split('\n')[1].split(':')[1];
        let questionTitle = questionTableString.split('\n')[2].split(':')[1];
        let questionTags: string[][] = JSON.parse(questionTableString.split('\n')[3].split(':')[1]);
        let questionDifficulty = questionTableString.split('\n')[4].split(':')[1].trim().replaceAll("\"", "");
        let questionDescription = "";
        
        // get description
        for (const line of questionTableString.split('\n').slice(5)){
            if (line.includes(":")){
                questionDescription += line.split(":")[1]
            } else {
                questionDescription += line
            }
        }

        // remove extra quotes and spaces
        questionID = questionID.trim()
        questionTitle = questionTitle.trim().replaceAll('"', '')
        questionDescription = questionDescription.trim()

        return [questionID, questionTitle, questionTags, questionDifficulty, questionDescription]
    }
}

export default MdQuestionExtractor;
