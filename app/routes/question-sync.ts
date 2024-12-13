import knex, {Knex} from 'knex';
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
    const alreadyInsertedQuestionIDs = await knexConnection.select("id").from("question");
    const insertedQuestions = new Set();
    for (let i = 0; i < alreadyInsertedQuestionIDs.length; i++) {
       insertedQuestions.add(alreadyInsertedQuestionIDs[i].id + "");
    }
    
    // insert only question ids not seen
    const questionsToInsert = questionService.getQuestions().filter((question) => !insertedQuestions.has(question.id)).map((question) => ({
        id: question.id, description: question.description, title: question.title, difficulty: 'easy'}));
    
    if (questionsToInsert.length > 0) {
        const fillQuestionTable = knexConnection("question").insert(questionsToInsert);
        await fillQuestionTable;
    }
    
    // update rows that have changed
    const currentQuestions = await knexConnection.select({id: 'id', title: 'title', description: 'description', difficulty: 'difficulty'}).from("question")
    const currentQuestionMapping = new Map();
    const questionsToUpdate = []

    for (let i = 0; i < currentQuestions.length; i++){
        currentQuestionMapping.set(currentQuestions[i].id, currentQuestions[i]);
    }

    for (const question of questionService.getQuestions()) {

    }

    

    return null
    
}