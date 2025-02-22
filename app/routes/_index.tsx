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
import DatabaseConnectionService from "~/database/connection/DatabaseConnectionService";
import QuestionDisplay from "~/components/QuestionDisplay";
import '../stylesheets/Index.css'

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub Code Editor" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


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
};

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
};

const getClassSignatures = async () => {
  const databaseConnectionService = DatabaseConnectionService.getInstance();
  const knexConnection = databaseConnectionService.getDatabaseConnection();
  let classSignatures = null;
  const getClassSignaturesPromise = knexConnection('class_definitions')
  .select('class_definitions.language', 'class_definitions.beginning', 'class_definitions.ending')
  .then((classDefinitions) => {
    classSignatures = classDefinitions;
  });

  try {
    await getClassSignaturesPromise;
  } catch (error) {
    console.error("Error getting class signatures: ", error);
  }
  return classSignatures;
};

const getQuestionFunctionSignatures = async (question) => {
  const databaseConnectionService = DatabaseConnectionService.getInstance();
  const knexConnection = databaseConnectionService.getDatabaseConnection();
  let functionSignatures = null;
  const getFunctionSignaturesPromise = knexConnection('signatures')
  .select('signatures.language_id', 'signatures.signature')
  .where('signatures.question_id', question?.id)
  .then((functionDefinition) => {
    functionSignatures = functionDefinition;
  });

  try {
    await getFunctionSignaturesPromise;
  } catch (error) {
    console.error("Error getting class signatures: ", error);
  }
  return functionSignatures;
};

const getLanguages = async () => {
  const databaseConnectionService = DatabaseConnectionService.getInstance();
  const knexConnection = databaseConnectionService.getDatabaseConnection();
  const getLanguagesPromise = knexConnection('languages')
  .select('languages.id', 'languages.name', 'languages.judge0_id')
  .then((languages) => {
    return languages
  });

  return getLanguagesPromise;
};

// Loader function to fetch languages
export const loader: LoaderFunction = async () => {
  const [languages, questions, classSignatures] = await Promise.all([getLanguages(), getQuestions(), getClassSignatures()]);
  let randomQuestion = null;
  let randomQuestionsTags = null;
  let questionFunctionSignatures = null;

  if (questions) {
    randomQuestion = questions[Math.floor(Math.random() * (questions as any[]).length)];
    randomQuestionsTags = await getQuestionTags(randomQuestion);
    questionFunctionSignatures = await getQuestionFunctionSignatures(randomQuestion);
  }
  return json({languages, randomQuestion, randomQuestionsTags, classSignatures, questionFunctionSignatures});
};

export default function Index() {
  const { languages, randomQuestion, randomQuestionsTags, classSignatures, questionFunctionSignatures } = useLoaderData<{ languages: LanguageOption[], randomQuestion:any[], randomQuestionsTags:any[], classSignatures: any[], questionFunctionSignatures: any[]}>();
  
  const functionSignatureDict = questionFunctionSignatures?.reduce((dict, questionFunctionSignature) => {
    dict[questionFunctionSignature.language_id] = questionFunctionSignature.signature;
    return dict;
  }, {} as Record<string, string>);
  // Class signature dictionary (language => class signature)
  const classSignatureDict = classSignatures.reduce((dict, classSignature) => {
    dict[classSignature.language] = {beginning: classSignature.beginning, ending: classSignature.ending};
    return dict;
  }, {} as Record<string, {beginning: string, ending: string}>);

  // Language dictionary to map IDs to language names
  const languageDict = languages?.reduce((dict, lang) => {
    dict[String(lang.id)] = {name: lang.name, judge0_id: lang.judge0_id};
    return dict;
  }, {} as Record<string, Object>) || {};

  // Selected language and editor state
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({ id: 6, name: "JavaScript", judge0_id: 63 });
  const [userCodeValue, setUserCodeValue] = useState<string>((selectedLanguage.id in classSignatureDict ? classSignatureDict[selectedLanguage.id].beginning + "\n" : "") 
  + functionSignatureDict[selectedLanguage.id]
  + "\n"
  + (selectedLanguage.id in classSignatureDict ? classSignatureDict[selectedLanguage.id].ending:""));
  const [codeResponse, setCodeResponse] = useState<string>("");
  const [codeIsExecuting, setCodeIsExecuting] = useState<boolean>(false);

  // Change editor depending on language
  const changeEditorOnLanguageChange = (language_id: string) => {
    if (language_id in functionSignatureDict) {
      
      setUserCodeValue((language_id in classSignatureDict ? classSignatureDict[language_id].beginning + "\n" : "") 
        + functionSignatureDict[language_id]
        + "\n"
        + (language_id in classSignatureDict ? classSignatureDict[language_id].ending : ""));
    } 
  }
  
  // Handle language selection change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLangId = e.target.value;
    changeEditorOnLanguageChange(selectedLangId);
    setSelectedLanguage({
      id: Number(selectedLangId),
      name: languageDict[selectedLangId].name,
      judge0_id: languageDict[selectedLangId].judge0_id
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
          display: 'flex'
        }}
      >
        <div id='questionDisplay' style={{
          float:'left',
          resize: 'horizontal',

        }}>
          <QuestionDisplay
            question = {randomQuestion}
            questionTags = {randomQuestionsTags}
          />
        </div>
        <div id='editor' style={{
          display:'inline',
        }}>
          <Editor
            height="50vh"
            width="70vw"
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