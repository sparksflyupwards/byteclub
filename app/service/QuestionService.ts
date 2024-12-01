import fs from 'node:fs';
import { Question, TestCases } from '~/interface/QuestionsSchema';

class QuestionService {

    // instance props
    private questionMDObjects: Question[] = []
    private questionsDirectory = "./byteclub-questions"

    private parseQuestionDetails = (questionFile: string) => {
        const questionTableString = questionFile.split("---")[1];
        let questionID = questionTableString.split('\n')[1];
        let questionTitle = questionTableString.split('\n')[2];
        let questionDescription = "";

        for (const line of questionTableString.split('\n').slice(3)){
            questionDescription += line
        }
        return [questionID, questionTitle, questionDescription]
    }

    private parseTestCases = (questionFile:string) => {

        const testCaseString = questionFile.split("---")[2];
        const inputIdentifiers = new Set<string>();
        const inputValues:string[] = [];
        const outputs: string[] = [];

        for (const line of testCaseString.split("```")) {
            if (line.includes("json")) {
                for (const row of line.split("\n")) {
                    if (row.includes(":")) {
                        const rowIdentifier = row.split(":")[0];
                        const rowValue = row.split(":")[1];
                        inputIdentifiers.add(rowIdentifier);
                        inputValues.push(rowValue);
                    } else if (row.includes("[")) {
                        outputs.push(row);
                    }
                }
            }
        }
        return [[...inputIdentifiers], inputValues, outputs]
    }
    
    private parseQuestionFiles = (questionFiles:string[]) => {
        questionFiles.forEach((fileName) => {
            if (fileName.split(".")[1] === "md") {

                const questionFile = fs.readFileSync(this.questionsDirectory+ "/" + fileName, "utf-8");

                const [questionID, questionTitle, questionDescription] = this.parseQuestionDetails(questionFile);

                const [inputIdentifiers, inputValues, outputs] = this.parseTestCases(questionFile);

                const tc = new TestCases(inputIdentifiers, inputValues, outputs);
                const qs = new Question(questionID, questionTitle, questionDescription, tc);
                this.questionMDObjects.push(qs);
            }
          });
    }
    
    public constructor() {
        const questionFiles = fs.readdirSync(this.questionsDirectory)
        if (questionFiles) {
            this.parseQuestionFiles(questionFiles);
        }
    }
}

export default QuestionService;
