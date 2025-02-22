import { json } from '@remix-run/node';
import DatabaseConnectionService from '~/database/connection/DatabaseConnectionService';
import QuestionParser from "~/questions/QuestionParser";
export let action = async ({request}) => {

    const databaseConnectionService = DatabaseConnectionService.getInstance();
    const knexConnection = databaseConnectionService.getDatabaseConnection();

    const questionService = new QuestionParser();
    
    const tagToIndex = new Map<string, string>();
    const languageToIndex = new Map<string, string>();
    const testCases = questionService.getTestCases();

    const testCasesToInsert = [];
    const questionToTagsToInsert = [];
    const questionsToInsert = [];
    const functionSignaturesToInsert = [];

    const classDefinitionsToInsert = Object.keys(questionService.classDefinitions).map((language_id) => {
        const classDefinition = {language: language_id, beginning: null, ending: null};
        classDefinition.beginning = questionService.classDefinitions[language_id]["beginning"];
        classDefinition.ending = questionService.classDefinitions[language_id]["end"];
        return classDefinition;
    });

    const tagDefinitionsToInsert = Object.keys(questionService.tagDefinitions).map((id) => {
        tagToIndex.set(questionService.tagDefinitions[id]["name"], id);
        const id_tag = { id: id, name: questionService.tagDefinitions[id]["name"], type: questionService.tagDefinitions[id]["type"]};
        return id_tag;
    });

    const languageDefinitions = questionService.parseLanguageDefinitions();
    Object.keys(languageDefinitions).map((language_id) => {
        languageToIndex.set(languageDefinitions[language_id].name , language_id);
    });

    for (const questionTestCaseID of testCases.keys()) {
        const questionID = questionTestCaseID.split("-")[0];
        const testCase = testCases.get(questionTestCaseID);
        testCasesToInsert.push({id:questionTestCaseID, question_id:questionID, input: JSON.stringify(testCase?.input), output: JSON.stringify(testCase?.output)})
    }

    for (const question of questionService.getQuestions()) {
        // get all tags and their mapping
        for (const [tag, tagType] of question.tags){
            questionToTagsToInsert.push({tag_id: tagToIndex.get(tag)+"", question_id:question.id});
        }
        // get all question signatures
        for (const language of question.signature.keys()) {
            functionSignaturesToInsert.push({question_id: question.id, language_id: languageToIndex.get(language), signature: question.signature.get(language)});
        }

        questionsToInsert.push({id:question.id, title:question.title, description: question.description, difficulty: question.difficulty})
    }

    if (languageDefinitions) {
        try {
            const languageDefinitionsToInsert = Object.keys(languageDefinitions).map((id) => {
                const languageDefinition = {id: id, name: languageDefinitions[id].name, judge0_id: languageDefinitions[id].judge0_id}
                return languageDefinition
            });
            const insertLanguageDefinitions = knexConnection('languages').insert(languageDefinitionsToInsert).onConflict("id").merge();
            await insertLanguageDefinitions;

            //await languageDefinitionsToInsert;
        } catch (error) {
            console.error("Error")
        }
    }

    if (classDefinitionsToInsert.length > 0) {
        const insertClassDefinitions = knexConnection('class_definitions').insert(classDefinitionsToInsert).onConflict("language").merge();
        try {
            await insertClassDefinitions;
        } catch(error) {
            console.error("Error inserting class definitions for questions: " + error);
        }
    }

    if (questionsToInsert.length > 0) {
        const insertQuestions = knexConnection('question').insert(questionsToInsert).onConflict("id").merge();
        try {
            await insertQuestions;
        } catch(error) {
            console.error("Error inserting questions: "+error);
        }
    }

    if (tagDefinitionsToInsert.length > 0) {
        const insertTags = knexConnection('tags').insert(tagDefinitionsToInsert).onConflict("id").merge();
        try { 
            await insertTags;
        } catch(error) {
            console.error("Error inserting in tags table: " + error);
        }
    }

    if (testCasesToInsert.length > 0) {
        const insertTestCases = knexConnection('test_cases').insert(testCasesToInsert).onConflict("id").merge();
        try {
            await insertTestCases;
        } catch (error) {
            console.error("Error inserting into test_cases table: "+error);
        }
    }

    if (questionToTagsToInsert.length > 0) {
        const insertQuestionToTags = knexConnection("question_tags").insert(questionToTagsToInsert).onConflict(['tag_id', 'question_id']).merge();
        try { 
            await insertQuestionToTags;
        } catch (error) {
            console.error("Error inserting into question_tags table: "+ error);
        }
    }

    if (functionSignaturesToInsert.length > 0) {
        const insertFunctionSignatures = knexConnection('signatures').insert(functionSignaturesToInsert).onConflict(["question_id", "language_id"]).merge();
        try {
            await insertFunctionSignatures;
        } catch(error) {
            console.error("Error adding function signatures: "+ error);
        };
    } 

    return json({message: "Successfully synced questions"});
    
}
