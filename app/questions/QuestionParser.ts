import fs from 'node:fs';
import { Invocation, Question, TestCase} from '~/interface/QuestionsSchema';
import MdQuestionParser from './MdQuestionParser';

enum QUESTION_FOLDERS {
    mainDirectory = "./byteclub-questions", definitionsFolder = "/definitions", signatureSubDirectory = "/signatures"
}

enum DEFINITION_FILES {
    classDefinitions = "classDefinitions.json",
    tagDefinitions = "tagDefinitions.json",
    invocationDefinitions = "invocationDefinitions.json",
    languageDefinitions = "languageDefinitions.json",
}

class QuestionParser {

    // instance props 
    private questionMDObjects: Question[] = [];
    private testCasesMapping: Map<string,TestCase> = new Map();
    public functionMapping: Map<string, Map<string, Invocation>> = new Map();

    public solutionClassDefinitions = {};
    public userClassDefinitions = {};
    public tagDefinitions = {};
    public languageDefinitions = {};

    private parseQuestionFiles = (questionFolders: string[]) => {
        const mdQuestionExtractor = new MdQuestionParser();
        
        questionFolders.forEach((folderName) => {
            const questionDirectory = QUESTION_FOLDERS.mainDirectory + "/" + folderName;
            const questionFiles = fs.readdirSync(questionDirectory);
            questionFiles.forEach((fileName) => {
                if (fs.statSync(questionDirectory+ "/" + fileName).isFile()) {
                    const questionFile = fs.readFileSync(questionDirectory+ "/" + fileName, "utf-8");
                    if (fileName.split(".")[1] === "md") {
                        // Extract question details from question table in question$id.md
                        const [questionID, questionTitle, questionTags, questionDifficulty, questionDescription ] = 
                        mdQuestionExtractor.parseQuestionDetails(questionFile);
                        const questionFunctionSignatures = this.parseFunctionSignatures(questionDirectory + QUESTION_FOLDERS.signatureSubDirectory);

                        const qs = new Question(questionID as string, questionTitle as string,
                            questionTags as string[][], questionDifficulty as string, 
                            questionDescription as string, questionFunctionSignatures);
                        this.questionMDObjects.push(qs);
                    } else if (fileName.split(".")[1] === "json") {
                        const questionTestcases = JSON.parse(questionFile);
                        const questionId = fileName.split(".")[0].replaceAll("testcases", "");

                        Object.keys(questionTestcases).forEach((testCaseKey) => {
                            if (!isNaN(+testCaseKey)) {
                                const questionTestCaseID = questionId+"-"+testCaseKey;
                                const testCase = { input:questionTestcases[testCaseKey].input, output:questionTestcases[testCaseKey].output, questionID: Number(questionId), id:Number(testCaseKey)} as TestCase;
                                this.testCasesMapping.set(questionTestCaseID,  testCase);
                            } else {
                                if (testCaseKey === "functionInvocation") {
                                    const invocations = new Map();
                                    Object.keys(questionTestcases[testCaseKey]).forEach((languageId) => {
                                        const functionCall = {start: questionTestcases[testCaseKey][languageId].start, end: questionTestcases[testCaseKey][languageId].end} as Invocation;
                                        invocations.set(languageId, functionCall);
                                    })
                                    this.functionMapping.set(questionId, invocations);
                                }

                            }
                        });
                        
                    }
                }
                
              });
        })

    };

    private parseClassDefinitions = () => {
        const classDefinitionsFile = QUESTION_FOLDERS.mainDirectory + QUESTION_FOLDERS.definitionsFolder + "/" + DEFINITION_FILES.classDefinitions;
        const classDefinitionString = fs.readFileSync(classDefinitionsFile, "utf-8");
        this.userClassDefinitions = JSON.parse(classDefinitionString);
    }

    private parseTagDefinitions = () => {
        const tagDefinitionsFile = QUESTION_FOLDERS.mainDirectory + QUESTION_FOLDERS.definitionsFolder + "/" + DEFINITION_FILES.tagDefinitions;
        const tagDefinitionsString = fs.readFileSync(tagDefinitionsFile, "utf-8");
        this.tagDefinitions = JSON.parse(tagDefinitionsString);
    }

    private parseSolutionClassDefinitions = () => {
        const solutionClassFile = QUESTION_FOLDERS.mainDirectory + QUESTION_FOLDERS.definitionsFolder + "/" + DEFINITION_FILES.invocationDefinitions;
        const solutionClassString = fs.readFileSync(solutionClassFile, "utf-8");
        this.solutionClassDefinitions = JSON.parse(solutionClassString);
    };

    private parseFunctionSignatures = (questionSignatureFolder) => {
        const signatureFiles = fs.readdirSync(questionSignatureFolder);
        const signatureMap = new Map<string, string>();
        signatureFiles.forEach((signatureFile) => {
            const signature = fs.readFileSync(questionSignatureFolder + "/" +signatureFile, "utf-8");
            signatureMap.set(signatureFile.split(".")[0], signature);
        });
        return signatureMap;
    };

    private  parseLanguageDefinitions = () => {
        const languageDefinitionsFile = QUESTION_FOLDERS.mainDirectory + QUESTION_FOLDERS.definitionsFolder + "/" + DEFINITION_FILES.languageDefinitions;
        const languageDefinitionsString = fs.readFileSync(languageDefinitionsFile, "utf-8");
        this.languageDefinitions =  JSON.parse(languageDefinitionsString);
    };
    
    public constructor() {
        this.parseClassDefinitions();
        this.parseTagDefinitions();
        this.parseSolutionClassDefinitions();
        const questionFolders = fs.readdirSync(QUESTION_FOLDERS.mainDirectory, {withFileTypes: true})
            .filter(possibleFolder => (possibleFolder.isDirectory() && possibleFolder.name.includes("question")))
            .map(folder => folder.name);

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
}

export default QuestionParser;
