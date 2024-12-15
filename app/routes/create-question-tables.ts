import { json } from "@remix-run/node";
import knex from "knex";

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

    const createQuestionTable =  knexConnection.schema.createTableIfNotExists("question", (table) => {
        table.increments("id").primary()
        table.text("title").notNullable()
        table.text("description").notNullable()
        table.enu("difficulty", ['EASY', 'MEDIUM', 'HARD'])
    });

    const createTestCasesTable =  knexConnection.schema.createTableIfNotExists("test_cases", (table) => {
        table.increments("id").primary()
        table.integer("question_id").unsigned().notNullable()
        table.jsonb("input").notNullable()
        table.jsonb("output").notNullable()

        table.foreign("question_id").references('id').inTable("question").onDelete('CASCADE');
    });

    const createTagsTable = knexConnection.schema.createTableIfNotExists("tags", (table) => {
        table.increments("id").primary()
        table.text("name").notNullable()
        table.enu("type", ["COMPANY", "TOPIC"])
    });

    const createQuestionTagsTable = knexConnection.schema.createTableIfNotExists("question_tags",(table) => {
        table.integer("tag_id").unsigned().notNullable()
        table.integer("question_id").unsigned().notNullable()

        table.foreign("tag_id").references("id").inTable("tags").onDelete('CASCADE');
        table.foreign("question_id").references("id").inTable("question").onDelete('CASCADE');
    });

    try {
        await Promise.all([createQuestionTable, createTagsTable]);
        await createTestCasesTable
        await createQuestionTagsTable
    } catch (e) {
        console.error("unable to create tables received the following error: "+ e)
    }

    

    return json({message: "tables created sucess"}, {status:200})
}