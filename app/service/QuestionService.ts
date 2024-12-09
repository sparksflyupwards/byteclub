import fs from 'node:fs';
import { Question} from '~/interface/QuestionsSchema';
import MdQuestionExtractor from './MdQuestionExtractor';

class QuestionService {

    // instance props 
    private questionMDObjects: Question[] = []
    private testCasesJsonObjects = new Map()
    private questionsDirectory = "./byteclub-questions"

    private parseQuestionFiles = (questionFiles:string[]) => {
        const mdQuestionExtractor = new MdQuestionExtractor()

        questionFiles.forEach((fileName) => {
            const questionFile = fs.readFileSync(this.questionsDirectory+ "/" + fileName, "utf-8");
            if (fileName.split(".")[1] === "md") {
                const [questionID, questionTitle, questionTags, questionDescription] = mdQuestionExtractor.parseQuestionDetails(questionFile);
                const qs = new Question(questionID as string, questionTitle as string, questionTags as string[], questionDescription as string);
                this.questionMDObjects.push(qs);
            } else if (fileName.split(".")[1] === "json") {
                const testCaseObj = JSON.parse(questionFile)
                const questionId = fileName.split(".")[0].replaceAll("testcases", "")
                this.testCasesJsonObjects.set(questionId, testCaseObj)
            }
          });
    }
    
    public constructor() {
        const questionFiles = fs.readdirSync(this.questionsDirectory)
        if (questionFiles) {
            this.parseQuestionFiles(questionFiles);
        }

        console.log("Found the following question test cases")
        this.questionMDObjects.forEach((questionObj) => {
            console.log(questionObj.id, this.testCasesJsonObjects.get(questionObj.id))
        })
    }
}

export default QuestionService;
