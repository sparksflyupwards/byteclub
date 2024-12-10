class MdQuestionExtractor {
    public parseQuestionDetails = (questionFile: string) => {
        const questionTableString = questionFile.split("---")[1];
        let questionID = questionTableString.split('\n')[1].split(':')[1];
        let questionTitle = questionTableString.split('\n')[2].split(':')[1];
        let questionTags: string[] = [];
        let questionDescription = "";
        
        // get description
        for (const line of questionTableString.split('\n').slice(4)){
            if (line.includes(":")){
                questionDescription += line.split(":")[1]
            } else {
                questionDescription += line
            }
        }

        // remove extra quotes and spaces
        questionID = questionID.trim()
        questionTitle = questionTitle.trim().replaceAll('"', '')
        for (const tag of questionTableString.split('\n')[3].split(':')[1].split(",")) {
            questionTags.push(tag.trim().replaceAll('"', '').replaceAll('[', '').replaceAll(']', ''));
        }
        questionDescription = questionDescription.trim()

        return [questionID, questionTitle, questionTags, questionDescription]
    }
}

export default MdQuestionExtractor;