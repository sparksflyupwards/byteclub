import { Box, Text } from "@mantine/core";
import '../stylesheets/tabdisplay.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ConversationDisplay from "./ConversationDisplay";

interface TabDisplayProps {
    question: any,
    questionTags: any,
    activeTab: number,
    userCode: string,
    questionDescription: string
}
const TabDisplay: React.FC<TabDisplayProps> = ({
    question,
    questionTags,
    activeTab,
    userCode,
    questionDescription
}) => {


    
    const tags = questionTags.map((tag: any) => 
        <a key={tag?.name}>{tag?.name}</a>
    )

    const questionInfoTab = (<Box className="vertical-tab-container">
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

    const aiAssistantTab = (<Box className="vertical-tab-container"><ConversationDisplay userCode={userCode} questionDescription={questionDescription} /></Box>);

    const tab3 = (<Box className="vertical-tab-container"></Box>);
    
    const tabContent = [questionInfoTab, aiAssistantTab, tab3];

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

export default TabDisplay;