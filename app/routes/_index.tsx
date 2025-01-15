import { Editor } from "@monaco-editor/react";
import {
  json,
  LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useState } from "react";
import CodeExecutor from "~/components/CodeExecutor";
import { useLoaderData } from "@remix-run/react";
import { LanguageOption } from "~/interface/CodeExecutionSchema";
import Judge0Service from "~/codeExecution/Jude0Service";
import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService";
import QuestionDisplay from "~/components/QuestionDisplay";

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub Code Editor" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
// Initialize Judge0 service instance
const judge0Service = Judge0Service.getInstance();

const getQuestions = async () => {
  const databaseConnectionService = DatabaseConnectionService.getInstance();
  const knexConnection = databaseConnectionService.getDatabaseConnection();
  let questions = null;
  const getQuestionPromise = knexConnection('question')
  .select('question.id', 'question.title', 'question.description', 'question.difficulty')
  .then((qs) => {
    questions = qs;
  })
  
  try {
    await getQuestionPromise;
  } catch (error) {
    console.error("Error getting question: ", error);
  }
  return questions
}

const getQuestionTags = async (question) => {
  const databaseConnectionService = DatabaseConnectionService.getInstance();
  const knexConnection = databaseConnectionService.getDatabaseConnection();
  let questionTags = null;

  const getQuestionTagsPromise = knexConnection('tags')
  .select('tags.name', 'tags.type')
  .join('question_tags','question_tags.tag_id', 'tags.id')
  .where('question_tags.question_id', question?.id)
  .then((tags) => {
    questionTags = tags
  });

  try {
    await getQuestionTagsPromise;
  } catch (error) {
    console.error("Error getting question tags: ", error);
  }
  return questionTags;
}

// Loader function to fetch languages
export const loader: LoaderFunction = async () => {
  const [languages, questions] = await Promise.all([judge0Service.getLanguageOptions(), getQuestions()]);
  let randomQuestion = null;
  let randomQuestionsTags = null;
  if (questions) {
    randomQuestion = questions[Math.floor(Math.random() * (questions as any[]).length)];
    randomQuestionsTags = await getQuestionTags(randomQuestion);
  }
  return json({languages, randomQuestion, randomQuestionsTags});
};

export default function Index() {
  const { languages, randomQuestion, randomQuestionsTags } = useLoaderData<{ languages: LanguageOption[], randomQuestion:any[], randomQuestionsTags:any[]}>();
  
  
  // Language dictionary to map IDs to language names
  const languageDict = languages?.reduce((dict, lang) => {
    dict[String(lang.id)] = lang.name;
    return dict;
  }, {} as Record<string, string>) || {};

  // Selected language and editor state
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({ id: 63, name: "JavaScript (Node.js 12.14.0)" });
  const [userCodeValue, setUserCodeValue] = useState<string>("// some comment");
  const [codeResponse, setCodeResponse] = useState<string>("");
  const [codeIsExecuting, setCodeIsExecuting] = useState<boolean>(false);

  // Handle language selection change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLangId = e.target.value;
    setSelectedLanguage({
      id: Number(selectedLangId),
      name: languageDict[selectedLangId]
    });
  };

  // Handle code execution request
  const handleCodeExecution = async () => {
    setCodeIsExecuting(true);
    
    try {
      const response = await fetch("/code-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: userCodeValue,
          selectedLanguage
        })
      });
      const data = await response.json();
      setCodeResponse(data);
    } catch (error) {
      console.error("Error executing code:", error);
    } finally {
      setCodeIsExecuting(false);
    }
  };

  // Handle changes in the Monaco editor
  const handleEditorChange = (value: string | undefined) => {
    if (value) setUserCodeValue(value);
  };

  // Render the editor and controls
  return (
    <div>
      <div id='questionWithEditor'
        style = {{
          display: 'inline-block'
        }}
      >
        <div id='questionDisplay' style={{
          float:'left',
          display:'inline',
          width:'30%',
          resize: 'horizontal',
        }}>
          <QuestionDisplay 
            question = {randomQuestion}
            questionTags = {randomQuestionsTags}
          />
        </div>
        <div id='editor' style={{
          float:'left',
          display:'inline',
          width:'49%',
        }}>
          <Editor
            height="50vh"
            width="90vw"
            theme="vs-dark"
            language={selectedLanguage?.name.split(" ")[0].toLowerCase()}
            defaultLanguage={selectedLanguage?.name.split(" ")[0].toLowerCase()}
            value={userCodeValue}
            onChange={handleEditorChange}
          />
        </div>
      </div>

      
      <select
        value={String(selectedLanguage?.id)}
        onChange={handleLanguageChange}
      >
        {languages?.map((language) => (
          <option value={String(language.id)} key={language.id}>
            {language.name}
          </option>
        ))}
      </select>

      <CodeExecutor
        codeIsExecuting={codeIsExecuting}
        handleCodeExecution={handleCodeExecution}
        codeResponse={codeResponse}
      />
    </div>
  );
}