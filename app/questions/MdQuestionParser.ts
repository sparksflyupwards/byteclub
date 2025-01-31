class MdQuestionParser {
    public parseQuestionDetails = (questionFile: string) => {
        const questionTableString = questionFile.split("---")[1];
        let id = questionTableString.split('\n')[1].split(':')[1];
        let title = questionTableString.split('\n')[2].split(':')[1];
        let tags: string[][] = JSON.parse(questionTableString.split('\n')[3].split(':')[1]);
        let difficulty = questionTableString.split('\n')[4].split(':')[1].trim().replaceAll("\"", "");
        let descriptionMatch = questionFile.match(/(?<=## Description)(.*)(?=## Test Cases)/s);
        let description = descriptionMatch ? descriptionMatch[0].trim() : null;
        
        // remove extra quotes and spaces
        id = id.trim();
        title = title.trim().replaceAll('"', '');
        
        return [id, title, tags, difficulty, description]
    }
}

export default MdQuestionParser;
