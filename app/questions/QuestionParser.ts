import fs from 'node:fs';
import { Question, TestCase} from '~/interface/QuestionsSchema';
import MdQuestionParser from './MdQuestionParser';

class QuestionParser {

    // instance props 
    private questionMDObjects: Question[] = [];
    private testCasesMapping: Map<string,TestCase> = new Map();

    static mainDirectory = "./byteclub-questions";
    static definitionsFolder = "/definitions"
    static signatureSubDirectory = "/signatures";

    public classDefinitions = {};
    public tagDefinitions = {};

    private parseQuestionFiles = (questionFolders: string[]) => {
        const mdQuestionExtractor = new MdQuestionParser();
        
        questionFolders.forEach((folderName) => {
            const questionDirectory = QuestionParser.mainDirectory + "/" + folderName;
            const questionFiles = fs.readdirSync(questionDirectory);
            questionFiles.forEach((fileName) => {
                if (fs.statSync(questionDirectory+ "/" + fileName).isFile()) {
                    const questionFile = fs.readFileSync(questionDirectory+ "/" + fileName, "utf-8");
                    if (fileName.split(".")[1] === "md") {
                        // Extract question details from question table in question$id.md
                        const [questionID, questionTitle, questionTags, questionDifficulty, questionDescription ] = 
                        mdQuestionExtractor.parseQuestionDetails(questionFile);
                        const questionFunctionSignatures = this.parseFunctionSignatures(questionDirectory + QuestionParser.signatureSubDirectory);

                        const qs = new Question(questionID as string, questionTitle as string,
                            questionTags as string[][], questionDifficulty as string, 
                            questionDescription as string, questionFunctionSignatures);
                        this.questionMDObjects.push(qs);
                    } else if (fileName.split(".")[1] === "json") {
                        const questionTestcases = JSON.parse(questionFile);
                        const questionId = fileName.split(".")[0].replaceAll("testcases", "");

                        Object.keys(questionTestcases).forEach((testCaseID) => {
                            if (!isNaN(+testCaseID)) {
                                const questionTestCaseID = questionId+"-"+testCaseID;
                                const testCase = { input:questionTestcases[testCaseID].input, output:questionTestcases[testCaseID].output, questionID: Number(questionId), id:Number(testCaseID)} as TestCase;
                                this.testCasesMapping.set(questionTestCaseID,  testCase);
                            }
                        });
                        
                    }
                }
                
              });
        })

    };

    private parseClassDefinitions = () => {
        const classDefinitionsFile = QuestionParser.mainDirectory + QuestionParser.definitionsFolder + "/" + "classDefinitions.json";
        const classDefinitionString = fs.readFileSync(classDefinitionsFile, "utf-8");
        this.classDefinitions = JSON.parse(classDefinitionString);
    }

    private parseTagDefinitions = () => {
        const tagDefinitionsFile = QuestionParser.mainDirectory + QuestionParser.definitionsFolder + "/" + "tagDefinitions.json";
        const tagDefinitionsString = fs.readFileSync(tagDefinitionsFile, "utf-8");
        this.tagDefinitions = JSON.parse(tagDefinitionsString);
    }

    private parseFunctionSignatures = (questionSignatureFolder) => {
        const signatureFiles = fs.readdirSync(questionSignatureFolder);
        const signatureMap = new Map<string, string>();
        signatureFiles.forEach((signatureFile) => {
            const signature = fs.readFileSync(questionSignatureFolder + "/" +signatureFile, "utf-8");
            signatureMap.set(signatureFile.split(".")[0], signature);
        });
        return signatureMap;
    }
    
    public constructor() {
        this.parseClassDefinitions();
        this.parseTagDefinitions();
        const questionFolders = fs.readdirSync(QuestionParser.mainDirectory, {withFileTypes: true}).filter(possibleFolder => (possibleFolder.isDirectory() && possibleFolder.name.includes("question"))).map(folder => folder.name);

        if (questionFolders) {
            this.parseQuestionFiles(questionFolders);
        }

    }

    public getQuestions() {
        return this.questionMDObjects;
    }

    public getTestCases() {
        return this.testCasesMapping;
    }

    public parseLanguageDefinitions = () => {
        const languageDefinitionsFile = QuestionParser.mainDirectory + QuestionParser.definitionsFolder + "/" + "languageDefinitions.json";
        const languageDefinitionsString = fs.readFileSync(languageDefinitionsFile, "utf-8");
        return JSON.parse(languageDefinitionsString);
    }
}

export default QuestionParser;
