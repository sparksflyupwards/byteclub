import fs from 'node:fs';

class QuestionService {

    // instance props
    private questionMDObjects: Question[] = []
    private questionsDirectory = "./byteclub-questions"

    public constructor() {
        const questionFiles = fs.readdirSync(this.questionsDirectory)
        if (questionFiles) {
            questionFiles.forEach((fileName) => {
                if (fileName.split(".")[1] === "md") {

                    const questionFile = fs.readFileSync(this.questionsDirectory+ "/" + fileName, "utf-8");
                    let tempID = "";
                    let tempTitle = "";
                    let tempDescription = "";

                    const questionTableString = questionFile.split("---")[1];
                    const testCaseString = questionFile.split("---")[2];
                    
                    for (const line of questionTableString.split('\n')){
                        if (line.includes(":")) {
                            const rowIdentifier = line.split(":")[0].trim();
                            const rowValue = line.split(":")[1].trim();
                            if ( rowIdentifier== "id") {
                                tempID = rowValue;
                            } else if (rowIdentifier == "title"){
                                tempTitle = rowValue;
                            } else if (rowIdentifier == "description") {
                                tempDescription = rowValue;
                            }
                        }                        
                    }

                    const inputIdentifiers = new Set<string>();
                    const inputValues = [];
                    const outputs = [];

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

                    const tc = new TestCases([...inputIdentifiers], inputValues, outputs);
                    const qs = new Question(tempID, tempTitle, tempDescription, tc);
                    this.questionMDObjects.push(qs);
                }
              });
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