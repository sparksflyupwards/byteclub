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
                    

                    for (const line of questionTableString.split('\n')){
                        if (line.includes(":")) {
                            const rowIdentifier = line.split(":")[0].trim();
                            const rowValue = line.split(":")[1].trim();
                            console.log(rowIdentifier, rowValue);
                            if ( rowIdentifier== "id") {
                                tempID = rowValue;
                            } else if (rowIdentifier == "title"){
                                tempTitle = rowValue;
                            } else if (rowIdentifier == "description") {
                                tempDescription = rowValue;
                            }
                        }                        
                    }

                    //const testCaseString = 

                        //console.log(tempID, tempTitle, tempDescription)
                }
              });
        }
    }
}

class Question {
    private id: string;
    private title: string;
    private description: string;

    public constructor(id : string, title : string, description:string) {
        this.id = id;
        this.title = title;
        this.description = description
    }
}

class TestCase {
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