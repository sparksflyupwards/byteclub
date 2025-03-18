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

enum CODE_SUBMISSION_DELIMETERS {testcaseEnd = "--TESTCASE_END--", questionIdOutput = "--QUESTION_ID_OUTPUT--"}

// Loader function to fetch languages
export const loader: LoaderFunction = async () => {
  const backendURL = process?.env?.BACKEND_URL;
  return await fetch(backendURL+'/index-loader', {
    method: "GET",
    headers: { "Content-Type": "application/json" }});
};

export default function Index() {
  const { languages, randomQuestion, randomQuestionsTags, classSignatures, questionFunctionSignatures, solutionClasses, solutionFunctions, testCases } = useLoaderData<{ languages: LanguageOption[], randomQuestion:any[], randomQuestionsTags:any[], classSignatures: any[], questionFunctionSignatures: any[], solutionClasses: Map<string, any>, solutionFunctions: Map<string, any>, testCases: any[]}>();
  
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
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({ id: 8, name: "Python3", judge0_id: 71 });
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
    console.log(randomQuestion.id+ "/"+e.target.value);
    const selectedLangId = e.target.value;
    changeEditorOnLanguageChange(selectedLangId);
    setSelectedLanguage({
      id: Number(selectedLangId),
      name: languageDict[selectedLangId].name,
      judge0_id: languageDict[selectedLangId].judge0_id
    });
  };

  // assemble test cases into function invocations currently only working for python 3. id:8
  const assembleTestCases = (questionId, languageId) => {
    const solutionClass = solutionClasses[languageId];
    const solutionFunction = solutionFunctions[questionId +"-"+languageId];

    const solutionClassImport = solutionClass.import ? solutionClass.import: "";
    const solutionClassStart = solutionClass.start ? solutionClass.start: "";
    const solutionClassEnd = solutionClass.end ? solutionClass.end : "";
    const solutionClassPrint = solutionClass.print ? solutionClass.print: "";

    const solutionFunctionStart = solutionFunction.start ? solutionFunction.start : "";
    const solutionFunctionEnd = solutionFunction.end ? solutionFunction.end : "";

    let testCaseCode =  solutionClassImport+ "\n" + userCodeValue + "\n" + solutionClassStart + "\n";

    testCases.forEach((tc, i) => {
      testCaseCode += solutionClassPrint + '( "' + tc.id + CODE_SUBMISSION_DELIMETERS.questionIdOutput + '"' + "+" + "str(solution." + solutionFunctionStart;
      Object.keys(tc.input).forEach((inputKey) => {
        testCaseCode += JSON.stringify(tc.input[inputKey]) + ",";
      });

      // remove last comma
      testCaseCode = testCaseCode.slice(0, -1) + solutionFunctionEnd + ')' + '+"';
      testCaseCode +=  i < (testCases.length-1)?CODE_SUBMISSION_DELIMETERS.testcaseEnd:"";
      testCaseCode += '"' + ')\n';
    })
    testCaseCode += solutionClassEnd;
    return testCaseCode;
  };

  const processTestCaseSubmission = (submissionOutput) => {
    return submissionOutput.trim().split(CODE_SUBMISSION_DELIMETERS.testcaseEnd).reduce((testcaseSubmissionMap,testcaseSubmission) => {
      const [testcaseIdText, output] = testcaseSubmission.trim().split(CODE_SUBMISSION_DELIMETERS.questionIdOutput);
      const testcaseId = testcaseIdText.trim();
      testcaseSubmissionMap[testcaseId] =  output;
      return testcaseSubmissionMap;
    }, {});
  }

  const checkTestCaseCorrectness = (testCaseOutput) => {
    let incorrectnessCount = 0
    let codeSubmissionOutput = ""

    for (const testCaseObj of testCases) {
      //correctnessStr += "You got: "+ testCaseOutput[testCaseObj.id].replace(/\s+/g, '') + " Expected was: "+ JSON.stringify(testCaseObj.output).replace(/\s+/g, '') + "\n";
      if (testCaseOutput[testCaseObj.id].replace(/\s+/g, '') == JSON.stringify(testCaseObj.output).replace(/\s+/g, '') ) {

      } else {
        incorrectnessCount += 1
        if (incorrectnessCount == 1) {
          codeSubmissionOutput += `Test case input: ${JSON.stringify(testCaseObj.input)} \n`;
          codeSubmissionOutput += "You got: "+ testCaseOutput[testCaseObj.id].replace(/\s+/g, '') + " Expected was: "+ JSON.stringify(testCaseObj.output).replace(/\s+/g, '') + "\n";
        }
      }
    }
    codeSubmissionOutput += " You got "+ (testCases.length - incorrectnessCount) + "/" + testCases.length + " testcases right\n ";
    return codeSubmissionOutput
  }

  // Handle code execution request
  const handleCodeExecution = async () => {
    setCodeIsExecuting(true);
    try {
      const codeSubmissionBody = {
        code: assembleTestCases(randomQuestion.id, selectedLanguage.id),
        selectedLanguage: selectedLanguage.judge0_id
      }
      console.log(JSON.parse(JSON.stringify(codeSubmissionBody)))
      const response = await fetch("/code-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(codeSubmissionBody)
      });
      const data = await response.json();
      const testCaseOutputMap = processTestCaseSubmission(data);
      const testCaseCorrectness = checkTestCaseCorrectness(testCaseOutputMap)
      setCodeResponse(testCaseCorrectness);
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