import fs from 'node:fs';

class QuestionService {

    // instance props
    private questionMDObjects: Question[] = []
    private questionsDirectory = "./byteclub-questions"

    private parseQuestionDetails = (questionFile: string) => {
        const questionTableString = questionFile.split("---")[1];
        let questionID = "";
        let questionTitle = "";
        let questionDescription = "";
        
        for (const line of questionTableString.split('\n')){
            if (line.includes(":")) {
                const rowIdentifier = line.split(":")[0].trim();
                const rowValue = line.split(":")[1].trim();
                if ( rowIdentifier== "id") {
                    questionID = rowValue;
                } else if (rowIdentifier == "title"){
                    questionTitle = rowValue;
                } else if (rowIdentifier == "description") {
                    questionDescription = rowValue;
                }
            }                        
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
            console.log(this.questionMDObjects);
        }

    }
}

class Question {
    private id: string;
    private title: string;
    private description: string;
    private testCases: TestCases

    public constructor(id : string, title : string, description:string, testCases:TestCases) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.testCases = testCases
    }
}

class TestCases {
    private inputs:string[];
    private input_values:string[];
    private expected_output_values:string[];

    public constructor(inputs: string[], input_values:string[], expected_output_values:string[]) {
        this.inputs = inputs;
        this.input_values = input_values;
        this.expected_output_values = expected_output_values;
    }
}

export default QuestionService;