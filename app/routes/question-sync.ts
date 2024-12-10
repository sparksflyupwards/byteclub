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

    const createQuestionTable =  knexConnection.schema.createTableIfNotExists("question", (table) => {
        table.increments("id").primary()
        table.text("title").notNullable()
        table.text("description").notNullable()
        table.specificType('tags', 'text[]')
    });

    const createTestCasesTable =  knexConnection.schema.createTableIfNotExists("test_cases", (table) => {
        table.increments("id").primary()
        table.jsonb("input").notNullable()
        table.jsonb("output").notNullable()
    });

    // create tables
    await Promise.all([createQuestionTable, createTestCasesTable]);

    // find which question ids are already inserted
    const alreadyInsertedQuestionIDs = await knexConnection.select("id").from("question");
    const insertedQuestions = new Set();
    for (let i = 0; i < alreadyInsertedQuestionIDs.length; i++) {
       insertedQuestions.add(alreadyInsertedQuestionIDs[i].id + "");
    }
    
    // insert only question ids not seen
    const questionsToInsert = questionService.getQuestions().filter((question) => !insertedQuestions.has(question.id));
    
    if (questionsToInsert.length > 0) {
        console.log(questionsToInsert)
        const fillQuestionTable = knexConnection("question").insert(questionsToInsert);
        await fillQuestionTable;
    }
    
    // // update rows that have changed
    // const currentQuestions = await knexConnection.select({id: 'id', title: 'title', description: 'description', tags: 'tags'}).from("question")
    // const currentQuestionMapping = Map();

    // for (let i = 0; i < currentQuestions.length; i++){
    //     currentQuestionMapping.set(currentQuestions[i].id, currentQuestions[i]);
    // }

    

    return null
    
}