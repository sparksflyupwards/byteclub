import knex, { Knex } from "knex";

class DatabaseConnectionService {
    private static instance: DatabaseConnectionService;
    private knex_config: Knex.Config = {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: 5431,
            user: 'postgres',
            password: "shakaib",
            database: "byteclubdb"
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