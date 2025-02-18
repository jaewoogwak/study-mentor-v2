import { create } from 'zustand';

export const useExamDataStore = create((set) => ({
    examData: null,
    setExamData: (newExamData) => set({ examData: newExamData }),
}));

export const usePromptStore = create((set) => ({
    prompt: '',
    setPrompt: (newPrompt) => set({ prompt: newPrompt }),
}));

export const useImagePromptStore = create((set) => ({
    imagePrompt: '',
    setImagePrompt: (newImagePrompt) => set({ imagePrompt: newImagePrompt }),
}));

export const useMultipleChoiceStore = create((set) => ({
    multipleChoice: 2,
    setMultipleChoice: (newMultipleChoice) =>
        set({ multipleChoice: newMultipleChoice }),
}));

export const useShortAnswerStore = create((set) => ({
    shortAnswer: 2,
    setShortAnswer: (newShortAnswer) => set({ shortAnswer: newShortAnswer }),
}));

export const useEssayStore = create((set) => ({
    essay: 2,
    setEssay: (newEssay) => set({ essay: newEssay }),
}));

export const useExamNumberStore = create((set) => ({
    examNumber: 0,
    setExamNumber: (newExamNumber) => set({ examNumber: newExamNumber }),
}));

export const useCheckedStore = create((set) => ({
    checked: false,
    setChecked: (newChecked) => set({ checked: newChecked }),
}));

export const useIsTextCenteredStore = create((set) => ({
    isTextCentered: false,
    setIsTextCentered: (newIsTextCentered) =>
        set({ isTextCentered: newIsTextCentered }),
}));

/* 

const [messages, setMessages] = useState([
        {
            message: '안녕하세요! 어떤 문제가 궁금하신가요?',
            sentTime: 'just now',
            sender: 'ChatGPT',
        },
    ]);

    const [isTyping, setIsTyping] = useState(false);

*/

export const useChatStore = create((set) => ({
    messages: [
        {
            message: '안녕하세요! 어떤 문제가 궁금하신가요?',
            sentTime: 'just now',
            sender: 'ChatGPT',
        },
    ],
    isTyping: false,
    questionData: '',

    setMessages: (newMessages) => set({ messages: newMessages }),
    setQuestionData: (newQuestionData) =>
        set({ questionData: newQuestionData }),
    setOutgoingMessage: (newMessage) =>
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    message: newMessage,
                    direction: 'outgoing',
                    sender: 'user',
                },
            ],
        })),
    setIncomingMessage: (newMessage) =>
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    message: newMessage,
                    direction: 'incoming',
                    sender: 'ChatGPT',
                },
            ],
        })),

    setIsTyping: (newIsTyping) => set({ isTyping: newIsTyping }),
    sendMessage: async (text, token) => {
        // token 가져오기

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/chatbot/question-answer`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question: text,
                }),
            }
        );

        const data = await response.json();
        console.log(data.answer);

        return data.answer;
    },
}));
