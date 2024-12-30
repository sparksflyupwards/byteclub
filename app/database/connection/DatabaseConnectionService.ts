import knex, { Knex } from "knex";

class DatabaseConnectionService {
    private static instance: DatabaseConnectionService;
    private knex_config: Knex.Config = {
        client: 'pg',
        connection: {
            host: process?.env?.PG_DB_HOST,
            port: Number(process?.env?.PG_DB_PORT),
            user: process?.env?.PG_DB_USER,
            password: process?.env?.PG_DB_PASSWORD,
            database: process?.env?.PG_DB_DATABASE
        }
    };
    private knexConnection;

    private constructor() {
        this.knexConnection = knex(this.knex_config);
    }

    public static getInstance(): DatabaseConnectionService {
        if (!DatabaseConnectionService.instance) {
            DatabaseConnectionService.instance = new DatabaseConnectionService();
        }
        return DatabaseConnectionService.instance;
    }

    public getDatabaseConnection() {
        return this.knexConnection;
    }

}

export default DatabaseConnectionService; 