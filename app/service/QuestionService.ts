import fs from 'node:fs';
import { Question, TestCases } from '~/interface/QuestionsSchema';

class QuestionService {

    // instance props
    private questionMDObjects: Question[] = []
    private questionsDirectory = "./byteclub-questions"

    private parseQuestionDetails = (questionFile: string) => {
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

    private parseTestCases = (questionFile:string) => {

        const testCaseString = questionFile.split("---")[2];
        const inputIdentifiers = new Set<string>();
        const inputValues:string[] = [];
        const outputs: string[] = [];

        for (const line of testCaseString.split("```")) {
            if (line.includes("json")) {
                for (const row of line.split("\n")) {
                    if (row.includes(":")) {
                        const rowIdentifier = row.split(":")[0].trim().replaceAll('"', '');
                        const rowValue = row.split(":")[1].trim();
                        inputIdentifiers.add(rowIdentifier);
                        inputValues.push(rowValue);
                    } else if (row.includes("[")) {
                        const output = row.trim()
                        outputs.push(output);
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

                const [questionID, questionTitle, questionTags, questionDescription] = this.parseQuestionDetails(questionFile);

                const [inputIdentifiers, inputValues, outputs] = this.parseTestCases(questionFile);

                const tc = new TestCases(inputIdentifiers, inputValues, outputs);
                console.log(inputIdentifiers, inputValues, outputs)
                const qs = new Question(questionID as string, questionTitle as string, questionTags as string[], questionDescription as string, tc);
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
