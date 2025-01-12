import { Box, Text } from "@mantine/core";

interface QuestionDisplayProps {
    question: any
}
const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question
}) => {
    return (
        <div>
            <Box>
                <Text>
                    {question?.id}
                </Text>
                <Text>
                    {question?.title}
                </Text>
                <Text>
                    {question?.description}
                </Text>
                <Text>
                    {question?.difficulty}
                </Text>
            </Box>
        </div>
    )
}

export default QuestionDisplay;