import { Box, Text } from "@mantine/core";
import '../stylesheets/questiondisplay.css';
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
        <div className="questionDisplay resizeable-horizontal">
            <div className = "resizeable-horizontal-handle">
                <Box>
                    <Text>
                        {question?.id}. {question?.title}
                    </Text>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} children ={`Description: `+(question?.description as string)} ></ReactMarkdown>
                    <Text>
                        Difficulty: {question?.difficulty}
                    </Text>
                    <hr />
                    <div className='col-box'>
                        {tags}
                    </div>
                </Box>
            </div>
        </div>
    )
}

export default QuestionDisplay;