import { json } from "@remix-run/node";
import knex, { Knex } from "knex";


export const loader = async ({request}) => {
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
    let url = new URL(request.url);
    let tagName = url.searchParams.get("tagName");
    
    const knexConnection = knex(knex_config);
    let resultantQuestions = undefined
    const getQuestion = knexConnection('question')
    .join('question_tags', 'question.id', 'question_tags.question_id') // Join question with question_tags
    .join('tags', 'question_tags.tag_id', 'tags.id') // Join with tags to get the tag name
    .where('tags.name', tagName) // Filter by the specific tag_id
    .select('question.id', 'question.title', 'question.description', 'question.difficulty') // Select relevant columns from the question table
    .then((questions) => {
        resultantQuestions = questions
      console.log('Questions with tag:', questions);
    })
    .catch((error) => {
      console.error('Error fetching questions:', error);
    })

    try {
        await getQuestion;
    } catch (e) {
        console.error(e)
    }
    
    return json({resultantQuestions})
}