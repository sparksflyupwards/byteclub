import { Box, Text } from "@mantine/core";
import '../stylesheets/Editor.css'

interface QuestionDisplayProps {
    question: any,
    questionTags: any,
}
const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    questionTags
}) => {
    const tags = questionTags.map((tag) => 
        <a>{tag?.name}</a>
    )

    return (
        <div
        style={{
          resize: 'horizontal',
        }}>
            <Box>
                <Text>
                    {question?.id}. {question?.title}
                </Text>
                <Text>
                    Description: {question?.description}
                </Text>
                <Text>
                    Difficulty: {question?.difficulty}
                </Text>
                <hr />
                <div class='col-box'>
                    {tags}
                </div>
                

            </Box>
        </div>
    )
}

export default QuestionDisplay;