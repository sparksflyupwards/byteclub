import { Box, Text } from "@mantine/core";
import '../stylesheets/questiondisplay.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuestionDisplayProps {
    question: any,
    questionTags: any,
    activeTab: number
}
const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    questionTags,
    activeTab
}) => {
    
    
    const tags = questionTags.map((tag) => 
        <a key={tag?.name}>{tag?.name}</a>
    )

    const tab1 = (<Box className="vertical-tab-container">
        <div>
            {question?.id}. {question?.title}
        </div>
        <ReactMarkdown remarkPlugins={[remarkGfm]} children ={`Description: `+(question?.description as string)} ></ReactMarkdown>
        <div>
            Difficulty: {question?.difficulty}
        </div>
        <hr />
        <div className='col-box'>
            {tags}
        </div>
    </Box>);

    const tab2 = (<Box className="vertical-tab-container"></Box>);

    const tab3 = (<Box className="vertical-tab-container"></Box>);
    
    const tabContent = [tab1, tab2, tab3];

    return (
        <div className="questionDisplay resizeable-horizontal">
            <div className = "resizeable-horizontal-handle">
                {/* <Box>
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
                </Box> */}
                
                <div className="tab-content">{tabContent[activeTab]}</div>
            </div>
        </div>
    )
}

export default QuestionDisplay;