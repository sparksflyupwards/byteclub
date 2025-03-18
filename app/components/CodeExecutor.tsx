import { Puff } from "react-loading-icons";
import { Button, Box, Text, Paper } from "@mantine/core";

interface CodeExecutorProps {
  codeIsExecuting: boolean;
  handleCodeExecution: () => void;
  codeResponse: string;
}

const CodeExecutor: React.FC<CodeExecutorProps> = ({
  codeIsExecuting,
  handleCodeExecution,
  codeResponse,
}) => {
  return (
    <div>
      {codeIsExecuting ? (
        <Puff stroke="#98ff98" />
      ) : (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#145DA0",
            border: "2px checked black",
            width: "900px",
          }}
        >
          <Paper
            shadow="xs"
            p="xl"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "400px",
              textAlign: "center",
            }}
          >
            <Text weight={700} size="lg" style={{ marginBottom: "20px" }}>
              Code Executor
            </Text>

            <Button
              variant="contained"
              color="primary"
              onClick={handleCodeExecution}
              style={{
                marginBottom: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Execute Code
            </Button>
            <div style={{ whiteSpace: "pre-line" }}>
              {(codeResponse && codeResponse)}
            </div>
            {/*<Text size="sm" color="dimmed">*/}
            {/*  {(codeResponse && JSON.stringify(codeResponse)) ||*/}
            {/*    "Execution result will be displayed here."}*/}
            {/*</Text>*/}
          </Paper>
        </Box>
      )}
    </div>
  );
};

export default CodeExecutor;
