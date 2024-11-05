import { Puff } from "react-loading-icons";

interface CodeExecutorProps {
  codeIsExecuting: boolean;
  handleCodeExecution: () => void;
  codeResponse: string;
}

const CodeExecutor: React.FC<CodeExecutorProps> = ({ codeIsExecuting, handleCodeExecution, codeResponse }) => {
  return (
    <div>
      {codeIsExecuting ? (
        <Puff stroke="#98ff98" />
      ) : (
        <div>
          <button onClick={handleCodeExecution}>Execute Code</button>
          <div>{JSON.stringify(codeResponse)}</div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutor;