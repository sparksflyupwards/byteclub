import { ActionFunctionArgs, json } from "@remix-run/node";
import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService";

export let action = async ({request}:ActionFunctionArgs) => {
    const databaseConnectionService = DatabaseConnectionService.getInstance();

    const knexConnection = databaseConnectionService.getDatabaseConnection();

    const createNewsletterSignupTable =  knexConnection.schema.createTableIfNotExists("newsletter_signup", (table) => {
        table.increments("id").primary();
        table.text("name").notNullable();
        table.text("email").notNullable();
        table.unique(["email"])
    });

    try {
        // seperating these promises bc foreign keys cant reference a table that isnt created
        await Promise.all([createNewsletterSignupTable]);
        
    } catch (e) {
        console.error("unable to create tables received the following error: "+ e);
    }

    return json({message: "tables created sucessfully"}, {status:200});
}
