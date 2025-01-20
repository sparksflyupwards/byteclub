import { Box, Text } from "@mantine/core";
import '../stylesheets/Editor.css';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
            class='questionDisplay'
            style={{
            resize: 'horizontal',
        }}>
            <Box>
                <Text>
                    {question?.id}. {question?.title}
                </Text>
                <ReactMarkdown remarkPlugins={[remarkGfm]} children ={`Description: `+(question?.description as string)} ></ReactMarkdown>
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