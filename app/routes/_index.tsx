import { Editor, useMonaco } from "@monaco-editor/react";
import {
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { SetStateAction, useEffect, useState } from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import MonacoEditor from "~/components/Editor";
import { Puff, ThreeDots } from "react-loading-icons";
import CodeExecutor from "~/components/CodeExecutor";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { LanguageOption } from "~/interface/CodeExecutionSchema";
import Judge0Service from "~/codeExecution/Jude0Service";

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub Code Editor" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
// Initialize Judge0 service instance
const judge0Service = Judge0Service.getInstance();

// Loader function to fetch languages
export const loader: LoaderFunction = async () => {
  const languages = await judge0Service.getLanguageOptions();
  return json({ languages });
};

export default function Index() {
  const { languages } = useLoaderData<{ languages: LanguageOption[] }>();
  
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
      <Editor
        height="50vh"
        width="90vw"
        theme="vs-dark"
        language={selectedLanguage?.name.split(" ")[0].toLowerCase()}
        defaultLanguage={selectedLanguage?.name.split(" ")[0].toLowerCase()}
        value={userCodeValue}
        onChange={handleEditorChange}
      />
      
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