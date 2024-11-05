import { Editor, useMonaco } from "@monaco-editor/react";
import type { MetaFunction } from "@remix-run/node";
import { SetStateAction, useEffect, useState } from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import MonacoEditor from "~/components/Editor";
import { Puff, ThreeDots } from "react-loading-icons";
import CodeExecutor from "~/components/CodeExecutor";

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub Code Editor" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Define the structure of a language option object
interface LanguageOption {
  id: number;
  name: string;
}

interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  error: string;
  status: number;
}

const LOCAL_JUDGE0_HOST = 'http://127.0.0.1:2358'
const JUDGE0_HOST = "https://judge0-ce.p.rapidapi.com";
const RAPID_API_KEY = ""
const RAPID_API_HOST = "judge0-ce.p.rapidapi.com"

export default function Index() {
  const [languages, setLanguages] = useState<LanguageOption[]>([]); // Typing the languages state as an array of LanguageOption
  const languageDict: Record<string, string> = {}; // Using Record for languageDict to map string keys to string values

  // Populate the language dictionary
  languages.forEach(
    (langObj: LanguageOption) =>
      (languageDict[String(langObj.id)] = langObj.name)
  );

  // Typing the selectedLanguage state to use LanguageOption
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({
    id: 63,
    name: "JavaScript (Node.js 12.14.0)",
  });

  // Typing the userCodeValue state to store the code value as a string
  const [userCodeValue, setUserCodeValue] = useState<string>("// some comment");

  // Typing the response from the code execution API as a string for simplicity
  const [codeResponse, setCodeResponse] = useState<string>("");

  // Typing the code execution status as a boolean
  const [codeIsExecuting, setCodeIsExecuting] = useState<boolean>(false);

  // Handle code execution
  const handleCodeExecution = () => {
    setCodeIsExecuting(true);
     // Adding headers to the axios request for RapidAPI authentication
     const headers = {
      "x-rapidapi-key": RAPID_API_KEY,
      "x-rapidapi-host": RAPID_API_HOST,
    };

    axios
      .post<CodeExecutionResponse>(
        JUDGE0_HOST + "/submissions/?base64_encoded=false&wait=true",
        {
          source_code: userCodeValue,
          language_id: selectedLanguage.id,
        },
        { headers } // Pass headers here
      )
      .then((response: AxiosResponse<CodeExecutionResponse>) => {
        setCodeIsExecuting(false);
        setCodeResponse(
          response.data.stdout ||
            response.data.stderr ||
            "Execution result not available"
        );
      })
      .catch((error: AxiosError) => {
        setCodeIsExecuting(false);
        setCodeResponse(error.message || "Error executing code");
      });
  };

  // Handle changes in the editor
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setUserCodeValue(value); // Update the state with the current code
    }
  };

  // Fetch available languages on component mount
  useEffect(() => {
    fetch(LOCAL_JUDGE0_HOST + "/languages")
      .then((response) => response.json())
      .then((data: LanguageOption[]) => {
        console.log("got data", data);
        setLanguages(data);
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
      });
  }, []);

  return (
    <>
      <Editor
        height="50vh"
        width="50vw"
        language={
          selectedLanguage
            ? selectedLanguage.name.split(" ")[0].toLowerCase()
            : "javascript"
        }
        defaultLanguage={
          selectedLanguage
            ? selectedLanguage.name.split(" ")[0].toLowerCase()
            : "javascript"
        }
        onChange={handleEditorChange}
        defaultValue="// some comment"
      />
      <select
        value={String(selectedLanguage?.id)}
        onChange={(e) =>
          setSelectedLanguage({
            id: Number(e.target.value),
            name: languageDict[e.target.value],
          })
        }
      >
        {languages.map((languageObj: LanguageOption) => (
          <option
            value={String(languageObj.id)}
            key={"lang-select:" + String(languageObj.id)}
          >
            {languageObj.name}
          </option>
        ))}
      </select>
      <CodeExecutor
        codeIsExecuting={codeIsExecuting}
        handleCodeExecution={handleCodeExecution}
        codeResponse={codeResponse}
      />
    </>
  );
}
