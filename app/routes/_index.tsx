import { Editor, useMonaco } from "@monaco-editor/react";
import type { MetaFunction } from "@remix-run/node";
import { SetStateAction, useEffect, useState } from "react";
import axios, { isCancel, AxiosError } from "axios";
import MonacoEditor from "~/components/Editor";

export const meta: MetaFunction = () => {
  return [
    { title: "ByteClub Code Editor" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface LanguageOption {
  id: number;
  name: string;
}
export default function Index() {
  const [languages, setLanguages] = useState([]);
  const languageDict: any = {};

  languages.forEach(
    (langObj: LanguageOption) =>
      (languageDict[String(langObj.id)] = langObj.name)
  );

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({
    id: 63,
    name: "JavaScript (Node.js 12.14.0)",
  });
  const [userCodeValue, setUserCodeValue] = useState<LanguageOption>({
    id: 63,
    name: "// some comment",
  });
  const [token, setToken] = useState("");
  const [isFetchingSubmission, setIsFetchSubmission] = useState(false);

  const handleCodeExecution = () => {
    /**
     *  POST -> http://127.0.0.1:2358/submissions/?base64_encoded=false&wait=false
     *  body -> {
    "source_code": "print(\"test\")",
    "language_id": 71
            }
     */
    axios
      .post(
        "http://127.0.0.1:2358/submissions/?base64_encoded=false&wait=false",
        {
          source_code: userCodeValue,
          language_id: selectedLanguage.id,
        }
      )
      .then((response) => {
        setToken(response.data.token);
        setIsFetchSubmission(true);
      });
  };

  const handleEditorChange = (value: SetStateAction<LanguageOption>) => {
    setUserCodeValue(value); // Update the state with the current code
  };

  useEffect(() => {
    fetch("http://127.0.0.1:2358/languages").then((response) =>
      response.json().then((data) => {
        console.log("got data", data);
        setLanguages(data);
      })
    );
  }, []);

  useEffect(() => {
    let submissionInterval: NodeJS.Timeout;
    if (isFetchingSubmission) {
       submissionInterval = setInterval(() => {
        // fetch submission
        const result = fetchSubmission(token);
        // if value found end polling
        if (result) {
          setIsFetchSubmission(false);
          clearInterval(submissionInterval);
        }
      }, 10000);
    }

    return () => clearInterval(submissionInterval);
  }, [isFetchingSubmission]);

  return (
    <>
      <Editor
        height="90vh"
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
      <button onClick={handleCodeExecution}>Execute Code</button>
    </>
  );
}
