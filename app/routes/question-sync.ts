import { json } from '@remix-run/node';
import DatabaseConnectionService from '~/database/connection/DatabaseConnectionService';
import QuestionParser from "~/questions/QuestionParser";
export let action = async ({request}) => {

    const databaseConnectionService = DatabaseConnectionService.getInstance();
    const knexConnection = databaseConnectionService.getDatabaseConnection();

    const questionService = new QuestionParser();
    
    // update question rows that have changed and gather tags
    const tagSet = new Set<string>();
    const tagIndexToTag = new Map<string, string>();
    const testCases = questionService.getTestCases();

    const testCasesToInsert = [];
    const tagsToInsert = [];
    const questionToTagsToInsert = [];
    const questionsToInsert = [];
    const classDefinitionsToInsert = Object.keys(questionService.classDefinitions).map((language) =>{
        const classDefinition = {language:language, beginning:null, ending:null};
        
        classDefinition.beginning = questionService.classDefinitions[language]["beginning"];
        classDefinition.ending = questionService.classDefinitions[language]["end"];
        
        return classDefinition;
    });

    const functionSignaturesToInsert = [];
    
    for (const questionTestCaseID of testCases.keys()) {
        const questionID = questionTestCaseID.split("-")[0];
        const testCase = testCases.get(questionTestCaseID);
        testCasesToInsert.push({id:questionTestCaseID, question_id:questionID, input: JSON.stringify(testCase?.input), output: JSON.stringify(testCase?.output)})
    }

    let tagIndex = 1;
    for (const question of questionService.getQuestions()) {
        // get all tags and their mapping
        for (const [tag, tagType] of question.tags){
            
            if (!tagSet.has(tag)) {
                tagSet.add(tag);
                tagIndexToTag.set(tag, tagIndex+"");
                tagsToInsert.push({id: tagIndex, name: tag, type: tagType});
                tagIndex++;
            }

            questionToTagsToInsert.push({tag_id: tagIndexToTag.get(tag)+"", question_id:question.id});
        }
        // get all question signatures
        for (const language of question.signature.keys()) {
            functionSignaturesToInsert.push({question_id: question.id, language: language, signature: question.signature.get(language)});
        }

        questionsToInsert.push({id:question.id, title:question.title, description: question.description, difficulty: question.difficulty})
    }

    if (functionSignaturesToInsert.length > 0) {
        const insertFunctionSignatures = knexConnection('signatures').insert(functionSignaturesToInsert).onConflict(["question_id", "language"]).merge();
        try {
            await insertFunctionSignatures;
        } catch(error) {
            console.error("Error adding function signatures: "+ error);
        };
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

    if (tagsToInsert.length > 0) {
        const insertTags = knexConnection('tags').insert(tagsToInsert).onConflict("id").merge();
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

    return json({message: "Successfully synced questions"});
    
}
