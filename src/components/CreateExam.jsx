// CreateExam.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

import styled from 'styled-components';
import correctImage from '../assets/correct.png';
import incorrectImage from '../assets/incorrect.png';
import ScoreModal from '../components/ScoreModal';
import logo from '../assets/logo.png';

import axios from 'axios';
import generatePDF from 'react-to-pdf';
import { v4 as uuidv4 } from 'uuid';
import PDFDownloadButton from './PDFDownloadButton';
import PDFGenerateButton from './PDFGenerateButton';
import { Spin } from 'antd';
import Spinner from './Spinner';

import { useChatStore } from '../contexts/store';
import {
    collection,
    setDoc,
    doc,
    getDocs,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const CreateExam = ({ data, setData }) => {
    const [questions, setQuestions] = useState([]);
    const [radioAnswers, setRadioAnswers] = useState(
        JSON.parse(localStorage.getItem('radioAnswers')) || {}
    );
    const [textAnswers, setTextAnswers] = useState(
        JSON.parse(localStorage.getItem('textAnswers')) || {}
    );
    const [results, setResults] = useState(
        JSON.parse(localStorage.getItem('results')) || {}
    );
    const [feedbackMessages, setFeedbackMessages] = useState(
        JSON.parse(localStorage.getItem('feedbackMessages')) || {}
    );

    const [score, setScore] = useState(0);
    const [warnings, setWarnings] = useState({});
    const [showExplanations, setShowExplanations] = useState(
        JSON.parse(localStorage.getItem('showExplanations')) || false
    );
    const [showExplanationButton, setShowExplanationButton] = useState(
        JSON.parse(localStorage.getItem('showExplanationButton')) || false
    );
    const [showQuestionButton, setshowQuestionButton] = useState(
        JSON.parse(localStorage.getItem('showQuestionButton')) || false
    );
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(
        JSON.parse(localStorage.getItem('isFeedbackOpen')) || false
    );
    const [isSubmitted, setIsSubmitted] = useState(
        JSON.parse(localStorage.getItem('isSubmitted')) || false
    );
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [submitHovering, setSubmitHovering] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [generatedExamId, setGeneratedExamId] = useState(() => {
        return localStorage.getItem('generatedExamId') || null;
    });

    const {
        messages,
        sendMessage,
        setIsTyping,
        setOutgoingMessage,
        setIncomingMessage,
        setQuestionData,
        questionData,
    } = useChatStore();
    const { user, login, logout } = useAuth();

    const targetRef = useRef();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // 문제 데이터 세팅
    useEffect(() => {
        if (data?.length > 0) {
            const filteredQuestions = data.map((item, index) => ({
                id: index,
                type: item.case,
                choices: item.choices,
                correct_answer: item.correct_answer,
                explanation: item.explanation,
                question: item.question,
                intent: item.intent,
            }));
            setQuestions(filteredQuestions);

            const loadedRadioAnswers =
                JSON.parse(localStorage.getItem('radioAnswers')) || {};
            const loadedTextAnswers =
                JSON.parse(localStorage.getItem('textAnswers')) || {};

            const initialRadioAnswers = {};
            const initialTextAnswers = {};

            filteredQuestions.forEach((q) => {
                if (q.type === 0) {
                    initialRadioAnswers[q.id] =
                        loadedRadioAnswers[q.id] || null;
                } else if (q.type === 1) {
                    initialTextAnswers[q.id] = loadedTextAnswers[q.id] || '';
                }
            });

            setRadioAnswers(initialRadioAnswers);
            setTextAnswers(initialTextAnswers);
        }
    }, [data]);

    // 로컬 스토리지 저장
    useEffect(() => {
        localStorage.setItem('radioAnswers', JSON.stringify(radioAnswers));
        localStorage.setItem('textAnswers', JSON.stringify(textAnswers));
        localStorage.setItem('results', JSON.stringify(results));
        localStorage.setItem('isSubmitted', JSON.stringify(isSubmitted));
        localStorage.setItem(
            'showExplanations',
            JSON.stringify(showExplanations)
        );
        localStorage.setItem(
            'showExplanationButton',
            JSON.stringify(showExplanationButton)
        );
        localStorage.setItem(
            'showQuestionButton',
            JSON.stringify(showQuestionButton)
        );
        localStorage.setItem('isFeedbackOpen', JSON.stringify(isFeedbackOpen));
        localStorage.setItem(
            'feedbackMessages',
            JSON.stringify(feedbackMessages)
        );
        localStorage.setItem('generatedExamId', generatedExamId);
    }, [
        radioAnswers,
        textAnswers,
        results,
        isSubmitted,
        showExplanations,
        showExplanationButton,
        showQuestionButton,
        isFeedbackOpen,
        feedbackMessages,
        generatedExamId,
    ]);

    // Firebase 저장
    const saveDataToFirebase = async (examData, feedbackData) => {
        try {
            if (!user) {
                console.error('User is not authenticated');
                return;
            }
            const userId = user.uid;
            let docId;

            if (!generatedExamId || generatedExamId === 'null') {
                const newExamId = uuidv4();
                docId = `exam_${newExamId}`;
                localStorage.setItem('generatedExamId', newExamId);
                setGeneratedExamId(newExamId);
            } else {
                docId = `exam_${generatedExamId}`;
            }

            const userDocRef = doc(db, 'users', userId, 'exams', docId);
            const docContent = {
                examData: {
                    ...examData,
                },
                feedbackData: {
                    ...feedbackData,
                },
                timestamp: new Date(),
            };

            await setDoc(userDocRef, docContent, { merge: true });
            console.log(
                'Exam and feedback saved for user ID:',
                userId,
                'Document ID:',
                docId
            );
        } catch (e) {
            console.error('Error adding document:', e.message);
        }
    };

    // 제출 시
    const onSubmit = async (formData) => {
        setIsSubmitted(true);

        const testResults = [];
        questions.forEach((question, index) => {
            const answer = formData[`question_${index}`];
            let user_answers;

            if (question.type === 0) {
                user_answers = parseInt(answer.split('')[0]);
            } else if (question.type === 1) {
                user_answers = formData[`question_${index}`];
            }

            const questionInfo = {
                index,
                question: question.question,
                choices: question.choices,
                correctAnswer: question.correct_answer,
                userAnswer: user_answers,
                explanation: question.explanation,
                intent: question.intent,
            };

            if (question.type === 0) {
                setRadioAnswers((prev) => ({
                    ...prev,
                    [question.id]: user_answers,
                }));
            } else if (question.type === 1) {
                setTextAnswers((prev) => ({
                    ...prev,
                    [question.id]: user_answers,
                }));
            }
            testResults.push(questionInfo);
        });

        const feedbackResults = {
            FeedBackResults: testResults,
        };

        // 서버에 제출
        const token = await user.getIdToken();
        axios({
            url: `${import.meta.env.VITE_API_URL}/feedback/`,
            method: 'POST',
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: feedbackResults,
        })
            .then((response) => {
                setIsGrading(false);
                getScore(response.data);
                saveDataToFirebase(questions, response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while submitting Exam.');
            });
    };

    // 서버에서 받은 채점 결과로 점수 계산
    const getScore = (AnswerJson) => {
        let correctCount = 0;
        const newResults = {};
        const newFeedbackMessages = {};

        AnswerJson.forEach((answer) => {
            newResults[answer.index] =
                answer.isCorrect === 1 ? 'correct' : 'incorrect';
            if (answer.isCorrect === 1) {
                correctCount++;
            } else {
                newFeedbackMessages[answer.index] = answer.feedback;
            }
        });

        setShowScoreModal(true);
        setShowExplanationButton(true);
        setshowQuestionButton(true);

        setResults(newResults);
        setScore(correctCount);
        setFeedbackMessages(newFeedbackMessages);
    };

    const ModalSubmit = () => {
        setIsGrading(true);
        handleSubmit(onSubmit)();
    };

    const handleCloseModal = () => {
        setShowScoreModal(false);
    };

    const toggleExplanations = () => {
        setShowExplanations((prev) => !prev);
        setIsFeedbackOpen((prevState) => {
            const newState = !prevState;
            localStorage.setItem('IsFeedbackOpen', JSON.stringify(newState));
            return newState;
        });
    };

    // 채팅봇 연결
    const findChatId = async () => {
        const currentUser = user.email;
        const messageSnapshot = await getDocs(collection(db, 'chats'));
        const match = [];
        messageSnapshot.forEach((doc) => {
            if (doc.data().email === currentUser) {
                match.push(doc.id);
            }
        });
        return match[0];
    };

    const handleGoToChatBot_withQuest = async (
        qid,
        ques,
        chc,
        user_answer,
        correct_answer
    ) => {
        const questionData = {
            question: ques,
            choices: chc,
            userAnswer: user_answer,
            correctAnswer: correct_answer,
        };

        const { question, choices, userAnswer, correctAnswer } = questionData;
        const formattedChoices = Array.isArray(choices) ? choices : ['빈칸'];

        const prompt = `문제 질문: ${question}
선택지: ${formattedChoices.join(', ')}
정답: ${correctAnswer}
나의 답안: ${userAnswer}
정답과 나의 답안을 비교하여 자세한 설명을 해줘.`;

        setOutgoingMessage(prompt);
        setQuestionData(prompt);

        navigate('/chatbot');
        setIsTyping(true);

        const token = await user.getIdToken();
        const res = await sendMessage(prompt, token);

        setIncomingMessage(res);

        const id = await findChatId();
        const currentUserMessage = {
            message: prompt,
            sender: 'user',
            direction: 'outgoing',
        };

        const chatRef = doc(db, 'chats', id);
        updateDoc(chatRef, {
            messages: [
                ...messages,
                currentUserMessage,
                {
                    message: res,
                    sender: 'ChatGPT',
                },
            ],
        });
        setIsTyping(false);
    };

    const handleGoToChatBot = () => {
        navigate('/chatbot');
    };

    const handlePDFGenerateClick = () => {
        setGeneratedExamId(null);
        setData(null);
        localStorage.removeItem('examData');
        clearAllLocalStorage();
    };

    const clearAllLocalStorage = () => {
        setRadioAnswers({});
        setTextAnswers({});
        setResults({});
        setIsSubmitted(false);
        setShowExplanations(false);
        setShowExplanationButton(false);
        setshowQuestionButton(false);
        setIsFeedbackOpen(false);
        setFeedbackMessages(false);

        window.location.reload();
    };

    Modal.setAppElement('#root');

    return (
        <Wrapper>
            {/* 채점 중이면 모달처럼 블러/오버레이 */}
            {isGrading && isSubmitted && (
                <GradingOverlay>
                    <GradingContainer>
                        <Spinner />
                        <GradingText>
                            채점 중입니다, 조금만 기다려주세요 ...
                        </GradingText>
                    </GradingContainer>
                </GradingOverlay>
            )}

            {/* 문제 데이터가 있을 때만 UI 표시 */}
            {data?.length > 0 && (
                <>
                    <DivisionLine />
                    <TopButtonArea>
                        <PDFGenerateButton
                            text='문제 새로 생성하기'
                            onClickHandle={handlePDFGenerateClick}
                        />
                        <PDFDownloadButton
                            text='문제 다운로드 하기'
                            onClickHandle={() =>
                                generatePDF(targetRef, {
                                    filename: 'study-mentor.pdf',
                                })
                            }
                        />
                    </TopButtonArea>
                </>
            )}

            {/* 로딩 표시 */}
            {data?.length === 0 && <div>Loading...</div>}

            {/* 시험지 */}
            {data?.length > 0 && (
                <ExamContainer ref={targetRef}>
                    <ExamHeader>
                        <ExamLogo src={logo} alt='logo' />
                        <ExamTitle>Study Mentor Exam</ExamTitle>
                    </ExamHeader>

                    <ExamInfo>
                        학번: <LineInput /> 이름: <LineInput />
                    </ExamInfo>
                    <ExamDivider />

                    <ExamForm onSubmit={handleSubmit(onSubmit)}>
                        <QuestionList>
                            {questions.map((question, index) => (
                                <QuestionCard key={question.id}>
                                    <QuestionHeader>
                                        <QuestionIndex
                                            className={results[question.id]}
                                        >{`${index + 1}.`}</QuestionIndex>
                                        <QuestionText>
                                            {question.question}
                                        </QuestionText>

                                        {/* 정/오 표시 */}
                                        {results[question.id] === 'correct' && (
                                            <ResultIcon
                                                src={correctImage}
                                                alt='Correct'
                                            />
                                        )}
                                        {results[question.id] ===
                                            'incorrect' && (
                                            <ResultIcon
                                                src={incorrectImage}
                                                alt='Incorrect'
                                            />
                                        )}

                                        {errors[`question_${index}`] && (
                                            <ErrorAlert>
                                                답안을 입력하세요.
                                            </ErrorAlert>
                                        )}
                                    </QuestionHeader>

                                    {/* 객관식 */}
                                    {Array.isArray(question.choices) ? (
                                        <ChoicesContainer>
                                            {question.choices.map(
                                                (choice, idx) => {
                                                    const isCorrectChoice =
                                                        parseInt(
                                                            choice.split('.')[0]
                                                        ) ===
                                                        question.correct_answer;
                                                    const isUserChecked =
                                                        radioAnswers[
                                                            question.id
                                                        ] ===
                                                        parseInt(
                                                            choice.split('')[0]
                                                        );

                                                    // '해설 보기' 상태에서 오답이고, 정답인 선택지를 강조
                                                    const highlightCondition =
                                                        isSubmitted &&
                                                        results[question.id] ===
                                                            'incorrect' &&
                                                        showExplanations &&
                                                        isCorrectChoice;

                                                    // 정답일 때 파란색 강조
                                                    const correctCondition =
                                                        isSubmitted &&
                                                        results[question.id] ===
                                                            'correct' &&
                                                        isCorrectChoice;

                                                    return (
                                                        <ChoiceLabel
                                                            key={idx}
                                                            highlight={
                                                                highlightCondition
                                                            }
                                                            correct={
                                                                correctCondition
                                                            }
                                                        >
                                                            <input
                                                                type='radio'
                                                                name={`question_${index}`}
                                                                value={choice}
                                                                disabled={
                                                                    isSubmitted
                                                                }
                                                                checked={
                                                                    isSubmitted
                                                                        ? isUserChecked
                                                                        : undefined
                                                                }
                                                                {...register(
                                                                    `question_${index}`,
                                                                    {
                                                                        required: true,
                                                                    }
                                                                )}
                                                            />
                                                            {choice}
                                                        </ChoiceLabel>
                                                    );
                                                }
                                            )}
                                        </ChoicesContainer>
                                    ) : (
                                        // 주관식
                                        <ShortAnswerInput
                                            type='text'
                                            disabled={isSubmitted}
                                            placeholder={
                                                isSubmitted
                                                    ? textAnswers[question.id]
                                                    : '정답을 입력하시오.'
                                            }
                                            {...register(`question_${index}`, {
                                                required: true,
                                            })}
                                        />
                                    )}

                                    {/* 해설, 피드백 */}
                                    {showExplanations && (
                                        <ExplanationBox>
                                            <ExplanationLine>
                                                <strong
                                                    style={{ color: '#6c63ff' }}
                                                >
                                                    정답 :{' '}
                                                    {question.correct_answer}
                                                </strong>
                                            </ExplanationLine>
                                            <ExplanationLine>
                                                <strong>
                                                    해설 :{' '}
                                                    {question.explanation}
                                                </strong>
                                            </ExplanationLine>

                                            {/* 오답 피드백 */}
                                            {results[question.id] ===
                                                'incorrect' &&
                                                feedbackMessages[
                                                    question.id
                                                ] && (
                                                    <FeedbackLine>
                                                        <strong>
                                                            피드백 :{' '}
                                                            {
                                                                feedbackMessages[
                                                                    question.id
                                                                ]
                                                            }
                                                        </strong>
                                                    </FeedbackLine>
                                                )}
                                            {/* 오답일 때 "질문하러 가기" 버튼 */}
                                            {results[question.id] ===
                                                'incorrect' && (
                                                <ChatBotArea>
                                                    <ChatBotButton
                                                        type='button'
                                                        onClick={() => {
                                                            const userAnswer =
                                                                question.type ===
                                                                0
                                                                    ? radioAnswers[
                                                                          question
                                                                              .id
                                                                      ]
                                                                    : textAnswers[
                                                                          question
                                                                              .id
                                                                      ];
                                                            handleGoToChatBot_withQuest(
                                                                question.id,
                                                                question.question,
                                                                question.choices,
                                                                userAnswer,
                                                                question.correct_answer
                                                            );
                                                        }}
                                                    >
                                                        질문하러 가기
                                                    </ChatBotButton>
                                                </ChatBotArea>
                                            )}
                                        </ExplanationBox>
                                    )}
                                </QuestionCard>
                            ))}
                        </QuestionList>

                        {/* 제출 및 해설/질문 버튼 */}
                        <ButtonRow>
                            <SubmitContainer>
                                <SubmitExamButton
                                    type='submit'
                                    disabled={isSubmitted}
                                    onMouseEnter={() => setSubmitHovering(true)}
                                    onMouseLeave={() =>
                                        setSubmitHovering(false)
                                    }
                                    onClick={ModalSubmit}
                                >
                                    제출하기
                                </SubmitExamButton>
                                {submitHovering && !isSubmitted && (
                                    <HoverWarning>
                                        ⚠️ 제출은 한 번만 가능합니다!
                                    </HoverWarning>
                                )}
                                {showScoreModal && (
                                    <ScoreModal
                                        isOpen={showScoreModal}
                                        onRequestClose={handleCloseModal}
                                        scoreData={{ score: score }}
                                        totalQuestion={questions.length}
                                    />
                                )}
                            </SubmitContainer>

                            {showExplanationButton && (
                                <ToggleExplanationButton
                                    type='button'
                                    onClick={toggleExplanations}
                                >
                                    {isFeedbackOpen
                                        ? '피드백 닫기'
                                        : '피드백 받기'}
                                </ToggleExplanationButton>
                            )}

                            {showQuestionButton && (
                                <AskButton
                                    type='button'
                                    onClick={handleGoToChatBot}
                                >
                                    질문하기
                                </AskButton>
                            )}
                        </ButtonRow>
                    </ExamForm>
                </ExamContainer>
            )}

            {data?.length > 0 && (
                <ResetArea onClick={clearAllLocalStorage}>
                    <ResetText>다시 풀기(새로고침)</ResetText>
                </ResetArea>
            )}
        </Wrapper>
    );
};

export default CreateExam;

/* ========== 스타일 정의 ========== */

/* 전체 Wrapper */
const Wrapper = styled.div`
    margin-top: 10px;
    padding: 0 10px;
`;

/* 채점 중 Overlay */
const GradingOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const GradingContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
    background-color: #fff;
    padding: 40px;
    border-radius: 10px;
    border: 3px solid #787878;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const GradingText = styled.div`
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
`;

/* 구분선 */
const DivisionLine = styled.div`
    border-top: 2px solid #ccc;
    margin: 30px auto;
    width: 300px;
    position: relative;
    text-align: center;

    &::after {
        content: '◆';
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fff;
        padding: 0 5px;
        color: #6c63ff;
        font-weight: bold;
    }
`;

const TopButtonArea = styled.div`
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
`;

/* 시험지 Container */
const ExamContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin: 0 auto 20px auto;
    background-color: #fafafa;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
`;

/* 시험지 헤더 */
const ExamHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
`;

const ExamLogo = styled.img`
    height: 60px;
    width: auto;
    margin-right: 15px;
`;

const ExamTitle = styled.h2`
    font-size: 26px;
    font-weight: bold;
    margin: 0;
    color: #333;
`;

/* 시험지 정보 (학번/이름) */
const ExamInfo = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 16px;
    color: #333;
`;

const LineInput = styled.span`
    display: inline-block;
    width: 100px;
    border-bottom: 2px solid #333;
    margin-right: 10px;
`;

const ExamDivider = styled.div`
    width: 100%;
    height: 1px;
    background-color: #ccc;
    margin-bottom: 20px;
`;

/* 폼 */
const ExamForm = styled.form`
    width: 100%;
`;

/* 문제 목록 */
const QuestionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 2px dashed #ccc;
`;

/* 문제 카드 */
const QuestionCard = styled.div`
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #eee;
    padding: 15px;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

/* 문제 헤더 */
const QuestionHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 12px;
`;

const QuestionIndex = styled.span`
    font-size: 18px;
    font-weight: bold;
    margin-right: 6px;

    &.incorrect {
        color: red;
    }
`;

const QuestionText = styled.span`
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

/* 정/오 이미지 */
const ResultIcon = styled.img`
    width: 24px;
    height: 24px;
    margin-left: 8px;
`;

/* 에러 표시 */
const ErrorAlert = styled.span`
    color: red;
    font-size: 14px;
    margin-left: 8px;
`;

/* 객관식 선택지 */
const ChoicesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ChoiceLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    color: #333;
    cursor: pointer;

    input[type='radio'] {
        transform: scale(1.1);
        margin-right: 5px;
    }

    /* 정답 강조 (오답 + 해설보기일 때 붉은색 / 정답일 때 파란색) */
    ${({ highlight }) =>
        highlight &&
        `
    color: #d9534f; 
    font-weight: bold;
  `}
    ${({ correct }) =>
        correct &&
        `
    color: #3f51b5; 
    font-weight: bold;
  `}
`;

/* 주관식 입력 */
const ShortAnswerInput = styled.input`
    width: 100%;
    padding: 10px;
    margin-top: 4px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
`;

/* 해설/피드백 박스 */
const ExplanationBox = styled.div`
    margin-top: 15px;
    background-color: #fdf4e7;
    border: 1px dashed #fd9f28;
    border-radius: 6px;
    padding: 12px;
`;

const ExplanationLine = styled.p`
    margin: 4px 0;
    font-size: 15px;
    color: #444;
`;

const FeedbackLine = styled.p`
    margin: 4px 0;
    font-size: 15px;
    color: #d9534f;
`;

const ChatBotArea = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
`;

const ChatBotButton = styled.button`
    padding: 8px 16px;
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        background-color: #ddd;
    }
`;

/* 제출/해설/질문 버튼 */
const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
`;

const SubmitContainer = styled.div`
    position: relative;
`;

const SubmitExamButton = styled.button`
    width: 130px;
    height: 45px;
    border-radius: 8px;
    border: none;
    background-color: #eee;
    color: #333;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 0 #999;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ddd;
    }
    &:active {
        background-color: #ccc;
        box-shadow: none;
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const HoverWarning = styled.div`
    position: absolute;
    bottom: 110%;
    left: 50%;
    transform: translateX(-50%);
    background: #ffded5;
    padding: 10px 20px;
    border: 2px solid #fd8a69;
    border-radius: 10px;
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
`;

const ToggleExplanationButton = styled.button`
    width: 130px;
    height: 45px;
    border-radius: 8px;
    border: none;
    background-color: #fff6e8;
    color: #333;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 0 #d8a35a;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ffe8ca;
    }
    &:active {
        background-color: #ffdb9b;
        box-shadow: none;
    }
`;

const AskButton = styled.button`
    width: 130px;
    height: 45px;
    border-radius: 8px;
    border: none;
    background-color: #ffe1d9;
    color: #333;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 0 #e3a99d;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ffd1c3;
    }
    &:active {
        background-color: #ffc1b2;
        box-shadow: none;
    }
`;

/* 새로고침(다시풀기) */
const ResetArea = styled.div`
    text-align: right;
    margin-right: 30px;
    margin-bottom: 20px;
`;

const ResetText = styled.button`
    font-size: 16px;
    border: none;
    background: transparent;
    color: #333;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        color: #777;
    }
`;
