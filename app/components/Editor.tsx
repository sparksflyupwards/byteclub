import { Editor } from "@monaco-editor/react";


const MonacoEditor = ({selectedLanguage, userCodeValue, handleEditorChange}) => {

    return (<>
    <Editor
        height="90vh"
        language={selectedLanguage ? selectedLanguage.name.split(" ")[0].toLowerCase() : 'javascript'}
        defaultLanguage={selectedLanguage ? selectedLanguage.name.split(" ")[0].toLowerCase() : 'javascript'}
        value={userCodeValue}
        onChange={handleEditorChange} 
        defaultValue="// some comment"
      />
    </>)
}

export default MonacoEditor;
