import { json } from "@remix-run/node";
import knex, { Knex } from "knex";
import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService";


export const loader = async ({request}) => {
    const databaseConnectionService = DatabaseConnectionService.getInstance();
    let url = new URL(request.url);
    let tagName = url.searchParams.get("tagName");
    

    const knexConnection = databaseConnectionService.getDatabaseConnection();

    let getQuestionQuery = knexConnection('question')
    .join('question_tags', 'question.id', 'question_tags.question_id') // Join question with question_tags
    .join('tags', 'question_tags.tag_id', 'tags.id'); // Join with tags to get the tag name
    if (tagName != null) {
        getQuestionQuery = getQuestionQuery.where('tags.name', tagName);
    }

    let returnedQuestion = null;

     // Filter by the specific tag_id
    let getQuestionPromise = getQuestionQuery.select('question.id', 'question.title', 'question.description', 'question.difficulty') // Select relevant columns from the question table
    .then((questions) => {
        returnedQuestion = questions[Math.floor(Math.random() * questions.length)];
      console.log('Questions with tag:', questions);
    })
    .catch((error) => {
      console.error('Error fetching questions:', error);
    })

    try {
        await getQuestionPromise;
    } catch (e) {
        console.error(e)
    }

    
    return json({returnedQuestion})
}