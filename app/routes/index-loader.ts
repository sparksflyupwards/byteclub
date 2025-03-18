import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService.ts";
import {json} from "@remix-run/node";

const getSolutionFunctions = async (knexConnection) => {
    let solutionFunctions = null;
    const getSolutionFunctionsPromise = knexConnection('solution_function')
        .select('solution_function.language_id', 'solution_function.question_id', 'solution_function.start', 'solution_function.end')
        .then((sf) => {
            solutionFunctions = sf.reduce((map, obj) => {
                map[obj.question_id+"-"+obj.language_id] = obj;
                return map;
            }, {});
        })

    try {
        await getSolutionFunctionsPromise;
    } catch (error) {
        console.error("Error getting solution functions: ", error);
    }

    return solutionFunctions;
}

const getSolutionClasses = async (knexConnection) => {
    let solutionClasses = null;
    const getSolutionClassesPromise = knexConnection('solution_class')
        .select('solution_class.language_id', 'solution_class.start', 'solution_class.end', 'solution_class.import', 'solution_class.print')
        .then((sc) => {
            solutionClasses = sc.reduce((map, obj) => {
                map[obj.language_id] = obj;
                return map;
            }, {});
        })

    try {
        await getSolutionClassesPromise;
    } catch (error) {
        console.error("Error getting solution functions: ", error);
    }
    return solutionClasses;
}

const getQuestions = async (knexConnection) => {
    let questions = null;
    // set to only get one question for now
    const getQuestionPromise = knexConnection('question')
        .select('question.id', 'question.title', 'question.description', 'question.difficulty')
        .then((qs) => {
            questions = qs;
        })

    try {
        await getQuestionPromise;
    } catch (error) {
        console.error("Error getting question: ", error);
    }
    return questions;
};

const getQuestionTags = async (question) => {
    const databaseConnectionService = DatabaseConnectionService.getInstance();
    const knexConnection = databaseConnectionService.getDatabaseConnection();
    let questionTags = null;

    const getQuestionTagsPromise = knexConnection('tags')
        .select('tags.name', 'tags.type')
        .join('question_tags','question_tags.tag_id', 'tags.id')
        .where('question_tags.question_id', question?.id)
        .then((tags) => {
            questionTags = tags
        });

    try {
        await getQuestionTagsPromise;
    } catch (error) {
        console.error("Error getting question tags: ", error);
    }
    return questionTags;
};

const getClassSignatures = async (knexConnection) => {
    let classSignatures = null;
    const getClassSignaturesPromise = knexConnection('class_definitions')
        .select('class_definitions.language', 'class_definitions.beginning', 'class_definitions.ending')
        .then((classDefinitions) => {
            classSignatures = classDefinitions;
        });

    try {
        await getClassSignaturesPromise;
    } catch (error) {
        console.error("Error getting class signatures: ", error);
    }
    return classSignatures;
};

const getQuestionFunctionSignatures = async (question, knexConnection) => {
    let functionSignatures = null;
    const getFunctionSignaturesPromise = knexConnection('signatures')
        .select('signatures.language_id', 'signatures.signature')
        .where('signatures.question_id', question?.id)
        .then((functionDefinition) => {
            functionSignatures = functionDefinition;
        });

    try {
        await getFunctionSignaturesPromise;
    } catch (error) {
        console.error("Error getting class signatures: ", error);
    }
    return functionSignatures;
};

const getLanguages = async (knexConnection) => {
    const getLanguagesPromise = knexConnection('languages')
        .select('languages.id', 'languages.name', 'languages.judge0_id')
        .where('languages.id', '8')
        .then((languages) => {
            return languages;
        });

    return getLanguagesPromise;
};

const getTestCases = async (questionId, knexConnection) => {
    let testCases = null;
    const getTestCasesPromise = knexConnection('test_cases')
        .select('test_cases.id', 'test_cases.input', 'test_cases.output')
        .where('test_cases.question_id', questionId)
        .then((tc) => {
            testCases = tc;
        });

    try {
        await getTestCasesPromise;
    } catch (error) {
        console.log("Error getting test cases: ", error);
    }

    return testCases;
}

export async function loader() {
    const databaseConnectionService = DatabaseConnectionService.getInstance();
    const knexConnection = databaseConnectionService.getDatabaseConnection();

    const [languages, questions, classSignatures, solutionClasses, solutionFunctions] = await Promise.all([getLanguages(knexConnection), getQuestions(knexConnection), getClassSignatures(knexConnection), getSolutionClasses(knexConnection), getSolutionFunctions(knexConnection)]);
    let randomQuestion = null;
    let randomQuestionsTags = null;
    let questionFunctionSignatures = null;
    let testCases = null;

    if (questions) {
        randomQuestion = questions[Math.floor(Math.random() * (questions as any[]).length)];
        randomQuestionsTags = await getQuestionTags(randomQuestion);
        questionFunctionSignatures = await getQuestionFunctionSignatures(randomQuestion, knexConnection);
        testCases = await getTestCases(randomQuestion.id, knexConnection)
    }

    return json({languages, randomQuestion, randomQuestionsTags, classSignatures, questionFunctionSignatures, solutionClasses, solutionFunctions, testCases});
}