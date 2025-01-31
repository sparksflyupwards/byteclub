import { json } from "@remix-run/node";
import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService";

export let action = async ({request}) => {
    const databaseConnectionService = DatabaseConnectionService.getInstance();

    const knexConnection = databaseConnectionService.getDatabaseConnection();

    const createQuestionTable =  knexConnection.schema.createTableIfNotExists("question", (table) => {
        table.increments("id").primary();
        table.text("title").notNullable();
        table.text("description").notNullable();
        table.enu("difficulty", ['EASY', 'MEDIUM', 'HARD']);
    });

    const createTestCasesTable =  knexConnection.schema.createTableIfNotExists("test_cases", (table) => {
        table.text("id").primary();
        table.integer("question_id").unsigned().notNullable();
        table.jsonb("input").notNullable();
        table.jsonb("output").notNullable();

        table.foreign("question_id").references('id').inTable("question").onDelete('CASCADE');
    });

    const createSignaturesTable =  knexConnection.schema.createTableIfNotExists("signatures", (table) => {
        table.integer("question_id").unsigned().notNullable();
        table.text("language").notNullable();
        table.text("signature").notNullable();
        table.foreign("question_id").references('id').inTable("question").onDelete('CASCADE');
        table.unique(["question_id", "language"]);
    });

    const createClassDefinitionsTable =  knexConnection.schema.createTableIfNotExists("class_definitions", (table) => {
        table.text("language").primary();
        table.text("beginning").notNullable();
        table.text("ending").notNullable();
    });

    const createTagsTable = knexConnection.schema.createTableIfNotExists("tags", (table) => {
        table.increments("id").primary();
        table.text("name").notNullable();
        table.enu("type", ["COMPANY", "TOPIC"]);
        table.text("label").notNullable();
    });

    const createQuestionTagsTable = knexConnection.schema.createTableIfNotExists("question_tags", (table) => {
        table.integer("tag_id").notNullable();
        table.integer("question_id").notNullable();

        table.foreign("tag_id").references("id").inTable("tags").onDelete('CASCADE');
        table.foreign("question_id").references("id").inTable("question").onDelete('CASCADE');
        
        table.unique(["tag_id", "question_id"]);
    });

    try {
        // seperating these promises bc foreign keys cant reference a table that isnt created
        await Promise.all([createQuestionTable, createTagsTable, createSignaturesTable, createClassDefinitionsTable]);
        
        await Promise.all([createTestCasesTable, createQuestionTagsTable]);
    } catch (e) {
        console.error("unable to create tables received the following error: "+ e);
    }

    return json({message: "tables created sucessfully"}, {status:200});
}
