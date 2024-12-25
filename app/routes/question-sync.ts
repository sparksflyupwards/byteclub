import knex, {Knex} from 'knex';
import { Question, TestCase } from '~/interface/QuestionsSchema';
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

    const questionService = new QuestionService();
    
    // update question rows that have changed and gather tags
    const tagSet = new Set<string>();
    const tagIndexToTag = new Map<string, string>();
    const testCases = questionService.getTestCases();

    const testCasesToInsert = [];
    const tagsToInsert = [];
    const questionToTagsToInsert = [];
    const questionsToInsert = [];
    
    for (const questionTestCaseID of testCases.keys()) {
        const questionID = questionTestCaseID.split("-")[0];
        const testCase = testCases.get(questionTestCaseID);
        testCasesToInsert.push({id:questionTestCaseID, question_id:questionID, input: JSON.stringify(testCase?.input), output: JSON.stringify(testCase?.output)})
    }

    let tagIndex = 1;
    for (const question of questionService.getQuestions()) {
        // get all tags and their mapping
        for (const [tag, tagType] of question.tags){
            
            if (!tagSet.has(tag)) {
                tagSet.add(tag);
                tagIndexToTag.set(tag, tagIndex+"");
                tagsToInsert.push({id: tagIndex, name: tag, type: tagType , label: tag});
                tagIndex++;
            }

            questionToTagsToInsert.push({tag_id: tagIndexToTag.get(tag)+"", question_id:question.id});

        }
        questionsToInsert.push({id:question.id, title:question.title, description: question.description, difficulty: question.difficulty})
    }

    if (questionsToInsert.length > 0) {
        const insertQuestions = knexConnection('question').insert(questionsToInsert).onConflict("id").merge();
        await insertQuestions;
    }

    if (tagsToInsert.length > 0) {
        const insertTags = knexConnection('tags').insert(tagsToInsert).onConflict("id").merge();
        await insertTags;
    }

    if (testCasesToInsert.length > 0) {
        const insertTestCases = knexConnection('test_cases').insert(testCasesToInsert).onConflict("id").merge();
        await insertTestCases;
    }

    if (questionToTagsToInsert.length > 0) {
        const insertQuestionToTags = knexConnection("question_tags").insert(questionToTagsToInsert).onConflict(['tag_id', 'question_id']).merge();
        await insertQuestionToTags;
    }

    return null;
    
}
