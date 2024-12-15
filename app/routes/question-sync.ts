import knex, {Knex} from 'knex';
import { Question } from '~/interface/QuestionsSchema';
import QuestionService from "~/service/QuestionService";
export let action = async ({request}) => {

    const knex_config: Knex.Config = {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: 5431,
            user: 'postgres',
            password: "shakaib",
            database: "byteclubdb"
        }
    };

    const knexConnection = knex(knex_config);

    const questionService = new QuestionService()
    
    // find which question ids are already inserted
    const alreadyInsertedQuestionIDs = await knexConnection.select("*").from("question");
    
    const insertedQuestions = new Set();
    for (let i = 0; i < alreadyInsertedQuestionIDs.length; i++) {
       insertedQuestions.add(alreadyInsertedQuestionIDs[i].id + "");
    }
    
    // insert only question ids not seen
    const questionsToInsert = questionService.getQuestions().filter((question) => !insertedQuestions.has(question.id)).map((question) => ({
        id: question.id, description: question.description, title: question.title, difficulty: 'EASY'}));
    
    if (questionsToInsert.length > 0) {
        const fillQuestionTable = knexConnection("question").insert(questionsToInsert);
        try {
            await fillQuestionTable;
        } catch (e) {
            console.error("unable to add questions to question table with the following error "+ e)
        }
        
    }
    
    // update question rows that have changed and gather tags
    const tagsSet = new Set<string[]>()
    const currentQuestionMapping = new Map<string, Question>();
    const testCases = questionService.getTestCases()

    const questionsToUpdate = []
    const testCasesToInsert = []
    const tagsToInsert = []
    
    for (const id of testCases.keys()){
        for (const testCaseID of Object.keys(testCases.get(id))) {
            const testCaseObj = Object()
            testCaseObj.question_id = id
            testCaseObj.input = testCases.get(id)[testCaseID].input
            testCaseObj.output = testCases.get(id)[testCaseID].output
            testCasesToInsert.push(testCaseObj)
        }
    }

    for (let i = 0; i < alreadyInsertedQuestionIDs.length; i++){
        currentQuestionMapping.set(alreadyInsertedQuestionIDs[i].id+"", alreadyInsertedQuestionIDs[i]);
    }

    for (const question of questionService.getQuestions()) {
        for (const tag of question.tags){
            tagsSet.add(tag)
        }

        if (currentQuestionMapping.has(question.id)) {
            const questionInDb = currentQuestionMapping.get(question.id)
            const fieldsToUpdate = Object()
            fieldsToUpdate.id = question.id

            if (questionInDb?.title !== question.title) {
                fieldsToUpdate.title = question.title
            }

            if (questionInDb?.description !== question.description) {
                fieldsToUpdate.description = question.description
            }

            if (Object.keys(fieldsToUpdate).length > 1) {
                questionsToUpdate.push(fieldsToUpdate)
            } 
        }
    }
    let tagIndex = 1
    for (const key of tagsSet.keys()) {
        const tagObj = Object()
        // tagObj.id = tagIndex
        // tagObj.name = 
        tagIndex += 1
    }

    if (questionsToUpdate) {
        const updateQuestionTable = knex('question').insert(questionsToUpdate).onConflict("id").merge(["description", "title", "difficulty"])
        await updateQuestionTable
    }

    return null
    
}