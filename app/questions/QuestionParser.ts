import fs from 'node:fs';
import { Question, TestCase} from '~/interface/QuestionsSchema';
import MdQuestionParser from './MdQuestionParser';

class QuestionParser {

    // instance props 
    private questionMDObjects: Question[] = [];
    private testCasesMapping: Map<string,TestCase> = new Map();
    private questionsDirectory = "./byteclub-questions"

    private parseQuestionFiles = (questionFiles:string[]) => {
        const mdQuestionExtractor = new MdQuestionParser()

        questionFiles.forEach((fileName) => {
            const questionFile = fs.readFileSync(this.questionsDirectory+ "/" + fileName, "utf-8");
            if (fileName.split(".")[1] === "md") {
                const [questionID, questionTitle, questionTags, questionDifficulty, questionDescription] = mdQuestionExtractor.parseQuestionDetails(questionFile);
                const qs = new Question(questionID as string, questionTitle as string, questionTags as string[][], questionDifficulty as string, questionDescription as string);
                this.questionMDObjects.push(qs);
            } else if (fileName.split(".")[1] === "json") {
                const questionTestcases = JSON.parse(questionFile);
                const questionId = fileName.split(".")[0].replaceAll("testcases", "");
                Object.keys(questionTestcases).forEach((testCaseID) => {
                    const questionTestCaseID = questionId+"-"+testCaseID
                    const testCase = { input:questionTestcases[testCaseID].input, output:questionTestcases[testCaseID].output, questionID: Number(questionId), id:Number(testCaseID)} as TestCase
                    this.testCasesMapping.set(questionTestCaseID,  testCase);
                });
                
            }
          });
    }
    
    public constructor() {
        const questionFiles = fs.readdirSync(this.questionsDirectory)
        if (questionFiles) {
            this.parseQuestionFiles(questionFiles);
        }

    }

    public getQuestions() {
        return this.questionMDObjects
    }

    public getTestCases() {
        return this.testCasesMapping
    }
}

export default QuestionParser;
