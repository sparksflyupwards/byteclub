import { Puff } from "react-loading-icons";
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';


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
        <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
      <Text fw={500}>Run Code</Text>
      </Card.Section>

      <Text size="sm" c="dimmed">
      {JSON.stringify(codeResponse)}
      </Text>

      <Button color="blue" fullWidth mt="md" radius="md" onClick={handleCodeExecution}>
      Execute Code
      </Button>
    </Card>
        
      )}
    </div>
  );
};




export default CodeExecutor;