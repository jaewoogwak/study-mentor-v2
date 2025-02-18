// CheckList.jsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import logo from '../assets/logo.png';

import {
    collection,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const CheckList = () => {
    const [documents, setDocuments] = useState([]);
    const [answersVisibility, setAnswersVisibility] = useState({});
    const [answers, setAnswers] = useState({});
    const [expandedDocId, setExpandedDocId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [entries, setEntries] = useState([]); // (원본 코드에서 entries를 어디서 set하는지 안 보이지만 유지)
    const entriesPerPage = 15;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                fetchDocuments(firebaseUser.uid);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchDocuments = async (userId) => {
        try {
            const examColRef = collection(db, 'users', userId, 'exams');
            const examQuery = query(examColRef, orderBy('timestamp', 'desc'));
            const examSnapshot = await getDocs(examQuery);

            if (examSnapshot.empty) {
                console.log('No documents found.');
                setLoading(false);
                return;
            }

            const ExamDocs = examSnapshot.docs.map((docItem) => {
                const data = docItem.data();
                const date = data.timestamp.toDate();
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                });

                return {
                    id: docItem.id,
                    examData: data.examData || {},
                    feedbackData: data.feedbackData || {},
                    timestamp: {
                        original: date,
                        formatted: formattedDate,
                    },
                };
            });

            console.log('ExamDocs with FeedbackData:', ExamDocs);
            setDocuments(ExamDocs);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setLoading(false);
        }
    };

    const handleToggleDocument = (id) => {
        setExpandedDocId(expandedDocId === id ? null : id);
    };

    const handleShowAllAnswers = (docId) => {
        setAnswersVisibility((prev) => ({
            ...prev,
            [docId]: !prev[docId],
        }));
    };

    const handleDeleteDocument = async (docId) => {
        try {
            if (user) {
                await deleteDoc(doc(db, 'users', user.uid, 'exams', docId));
                await deleteDoc(doc(db, 'users', user.uid, 'feedbacks', docId));
                setDocuments((prevDocs) =>
                    prevDocs.filter((d) => d.id !== docId)
                );
            }
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const handleRadioChange = (questionIndex, choiceIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [`q${questionIndex}`]: choiceIndex,
        }));
    };

    const handleTextChange = (questionIndex, event) => {
        setAnswers((prev) => ({
            ...prev,
            [`q${questionIndex}`]: event.target.value,
        }));
    };

    const totalPages = Math.ceil(entries.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const currentEntries = entries.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <LoadingText>Loading...</LoadingText>;
    }

    if (!user) {
        return <LoadingText>로그인이 필요합니다.</LoadingText>;
    }

    return (
        <Wrapper>
            {documents.length > 0 ? (
                documents.map((docItem) => (
                    <ExamCard key={docItem.id}>
                        <ExamToggleButton
                            onClick={() => handleToggleDocument(docItem.id)}
                        >
                            Exam (Date:{' '}
                            {docItem.timestamp?.formatted || 'No Date'})
                        </ExamToggleButton>

                        {/* 펼쳐졌을 때 내용 표시 */}
                        {expandedDocId === docItem.id && (
                            <ExamContent>
                                <ExamHeader>
                                    <ExamHeaderTop>
                                        <LogoImg src={logo} alt='logo' />
                                        <ExamTitle>ReExamination</ExamTitle>
                                    </ExamHeaderTop>
                                    <ExamInfo>
                                        학번 : <UnderLine /> 이름 :{' '}
                                        <UnderLine />
                                    </ExamInfo>
                                </ExamHeader>
                                <Divider />

                                {docItem.examData &&
                                Object.keys(docItem.examData).length > 0 ? (
                                    <>
                                        {Object.entries(docItem.examData).map(
                                            ([index, item]) => {
                                                const isCorrect =
                                                    docItem.feedbackData?.[
                                                        index
                                                    ]?.isCorrect;
                                                const questionColor =
                                                    isCorrect === 1
                                                        ? '#3f51b5'
                                                        : isCorrect === 0
                                                        ? '#d9534f'
                                                        : '#333';

                                                return (
                                                    <QuestionBlock key={index}>
                                                        <QuestionTitle
                                                            style={{
                                                                color: questionColor,
                                                            }}
                                                        >
                                                            <QIndex>
                                                                Question{' '}
                                                                {parseInt(
                                                                    index
                                                                ) + 1}
                                                                .
                                                            </QIndex>
                                                            <QText>
                                                                {item.question}
                                                            </QText>
                                                        </QuestionTitle>

                                                        {/* 객관식 */}
                                                        {item.type === 0 ? (
                                                            <ChoicesWrapper>
                                                                {Array.isArray(
                                                                    item.choices
                                                                ) ? (
                                                                    item.choices.map(
                                                                        (
                                                                            choice,
                                                                            i
                                                                        ) => (
                                                                            <ChoiceItem
                                                                                key={
                                                                                    i
                                                                                }
                                                                            >
                                                                                <input
                                                                                    type='radio'
                                                                                    id={`q${index}_c${i}`}
                                                                                    name={`q${index}`}
                                                                                    onChange={() =>
                                                                                        handleRadioChange(
                                                                                            index,
                                                                                            i
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <label
                                                                                    htmlFor={`q${index}_c${i}`}
                                                                                >
                                                                                    {
                                                                                        choice
                                                                                    }
                                                                                </label>
                                                                            </ChoiceItem>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <p>
                                                                        {
                                                                            item.choices
                                                                        }
                                                                    </p>
                                                                )}
                                                            </ChoicesWrapper>
                                                        ) : (
                                                            // 주관식
                                                            <ShortAnswerBox>
                                                                <ShortAnswerInput
                                                                    type='text'
                                                                    value={
                                                                        answers[
                                                                            `q${index}`
                                                                        ] || ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleTextChange(
                                                                            index,
                                                                            e
                                                                        )
                                                                    }
                                                                />
                                                            </ShortAnswerBox>
                                                        )}

                                                        {/* 답안/해설 보기 토글 */}
                                                        {answersVisibility[
                                                            docItem.id
                                                        ] && (
                                                            <AnswerBox>
                                                                <AnswerLine>
                                                                    <strong>
                                                                        답:
                                                                    </strong>{' '}
                                                                    {
                                                                        item.correct_answer
                                                                    }
                                                                </AnswerLine>
                                                                <AnswerLine>
                                                                    <strong>
                                                                        설명:
                                                                    </strong>{' '}
                                                                    {
                                                                        item.explanation
                                                                    }
                                                                </AnswerLine>
                                                                <AnswerLine>
                                                                    <strong>
                                                                        출제
                                                                        의도:
                                                                    </strong>{' '}
                                                                    {
                                                                        item.intent
                                                                    }
                                                                </AnswerLine>
                                                            </AnswerBox>
                                                        )}
                                                    </QuestionBlock>
                                                );
                                            }
                                        )}
                                        <ShowAllButton
                                            onClick={() =>
                                                handleShowAllAnswers(docItem.id)
                                            }
                                        >
                                            {answersVisibility[docItem.id]
                                                ? '답안 숨기기'
                                                : '답안 보기'}
                                        </ShowAllButton>
                                    </>
                                ) : (
                                    <NoItems>문항 데이터가 없습니다.</NoItems>
                                )}

                                <DashedLine />
                                <DeleteButton
                                    onClick={() =>
                                        handleDeleteDocument(docItem.id)
                                    }
                                >
                                    삭제하기 (영구)
                                </DeleteButton>
                            </ExamContent>
                        )}
                    </ExamCard>
                ))
            ) : (
                <NoDataMessage>
                    👨‍💻 데이터가 없습니다.
                    <br />
                    시험문제를 먼저 생성해보세요.
                </NoDataMessage>
            )}

            {/* 페이지네이션 (entries를 사용 중이나, 실제 사용처는 미정) */}
            {documents.length > 0 && (
                <Pagination>
                    {Array.from({ length: totalPages }, (_, idx) => (
                        <PageButton
                            key={idx + 1}
                            onClick={() => handlePageChange(idx + 1)}
                            isActive={currentPage === idx + 1}
                        >
                            {idx + 1}
                        </PageButton>
                    ))}
                </Pagination>
            )}
        </Wrapper>
    );
};

export default CheckList;

/* ========== 스타일 정의 ========== */

/* 공통 Wrapper */
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
    min-height: 70vh; /* 페이지가 너무 짧을 때 대비 */
    max-width: 900px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 10px;
        width: 95%;
    }
`;

/* 로딩/로그인 필요 메시지 */
const LoadingText = styled.h2`
    text-align: center;
    margin-top: 50px;
    color: #666;
`;

/* 문서(시험) 카드 */
const ExamCard = styled.div`
    margin-bottom: 20px;
    border-radius: 8px;
`;

/* 시험 펼치기/접기 버튼 */
const ExamToggleButton = styled.button`
    width: 100%;
    height: 60px;
    border-radius: 8px;
    border: none;
    background-color: #fdf4e7;
    font-family: 'Pretendard-Regular', sans-serif;
    font-size: 18px;
    color: #333;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 6px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #fce8d9;
    }

    &:active {
        background-color: #fcdcc7;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        font-size: 15px;
        height: 50px;
    }
`;

/* 펼쳐진 시험 내용 컨테이너 */
const ExamContent = styled.div`
    background-color: #fafafa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px 30px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);

    @media (max-width: 768px) {
        padding: 15px 20px;
    }
`;

/* 시험 상단 헤더 */
const ExamHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ExamHeaderTop = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
`;

const LogoImg = styled.img`
    height: 50px;
    width: auto;

    @media (min-width: 768px) {
        height: 60px;
    }
`;

const ExamTitle = styled.h2`
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    color: #333;
`;

const ExamInfo = styled.div`
    margin-top: 10px;
    font-size: 16px;
    color: #444;
    display: flex;
    gap: 8px;
    align-items: center;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const UnderLine = styled.span`
    display: inline-block;
    width: 80px;
    border-bottom: 2px solid #444;
    margin-right: 10px;

    @media (max-width: 768px) {
        width: 60px;
    }
`;

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: #ccc;
    margin: 20px 0;
`;

/* 문항들 */
const QuestionBlock = styled.div`
    margin-top: 30px;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const QuestionTitle = styled.div`
    margin-bottom: 10px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
`;

const QIndex = styled.span`
    font-size: 18px;
`;

const QText = styled.span`
    font-size: 16px;
    margin-top: 5px;
    color: #333;
`;

/* 객관식 */
const ChoicesWrapper = styled.div`
    margin: 15px 0;
`;

const ChoiceItem = styled.div`
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    input[type='radio'] {
        margin-right: 8px;
        transform: scale(1.1);
    }

    label {
        font-size: 15px;
        color: #333;
    }
`;

/* 주관식 */
const ShortAnswerBox = styled.div`
    margin: 15px 0;
`;

const ShortAnswerInput = styled.input`
    width: 100%;
    max-width: 400px;
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

/* 해설(답안) 박스 */
const AnswerBox = styled.div`
    margin-top: 15px;
    background-color: #fff6e8;
    border: 1px dashed #fd9f28;
    border-radius: 6px;
    padding: 12px;
`;

const AnswerLine = styled.p`
    margin: 4px 0;
    font-size: 15px;
    color: #444;
`;

/* 답안 보기/숨기기 버튼 */
const ShowAllButton = styled.button`
    margin-top: 20px;
    font-family: 'Pretendard-Regular', sans-serif;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background-color: #fff6e8;
    cursor: pointer;
    font-size: 15px;
    color: #333;
    box-shadow: 0 2px 0 #d8a35a;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ffe8ca;
    }
    &:active {
        background-color: #ffdb9b;
        box-shadow: none;
    }

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const DashedLine = styled.div`
    margin: 30px 0;
    border-top: 1px dashed #ccc;
    width: 100%;
`;

/* 문서 삭제 버튼 */
const DeleteButton = styled.button`
    font-family: 'Pretendard-Regular', sans-serif;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background-color: #eee;
    cursor: pointer;
    font-size: 15px;
    color: #333;
    box-shadow: 0 2px 0 #999;
    transition: background-color 0.3s;
    margin-top: 10px;

    &:hover {
        background-color: #ddd;
    }
    &:active {
        background-color: #ccc;
        box-shadow: none;
    }

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

/* 문서(시험) 없음 */
const NoDataMessage = styled.p`
    font-size: 18px;
    text-align: center;
    margin: 60px 0;
    line-height: 1.5;
    color: #666;
`;

/* 페이지네이션 */
const Pagination = styled.div`
    margin: 30px;
    text-align: center;
`;

const PageButton = styled.button`
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ccc;
    margin-right: 6px;
    border-radius: 4px;
    background-color: ${({ isActive }) => (isActive ? '#ddd' : '#fff')};

    &:hover {
        background-color: #eee;
    }

    @media (max-width: 768px) {
        font-size: 12px;
        padding: 4px 8px;
    }
`;
