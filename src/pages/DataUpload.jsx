import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import CreateExam from '../components/CreateExam';
import InfoFooter from '../components/InfoFooter';

import LogoImg from '../assets/datauploadlogo.png';
import PDFUpload from '../components/PDFUpload';

const DataUpload = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState(null);

    // 문제 세팅 관련 상태
    const [multipleChoice, setMultipleChoice] = useState(20);
    const [shortAnswer, setShortAnswer] = useState(0);
    const [essay, setEssay] = useState(0);
    const [examNumber, setExamNumber] = useState(2);
    const [prompt, setPrompt] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [isTextCentered, setIsTextCentered] = useState(false);
    const [isLectureOnly, setIsLectureOnly] = useState(0);

    useEffect(() => {
        const localData = localStorage.getItem('examData');
        if (localData) {
            setData(JSON.parse(localData));
        }
    }, [user]);

    return (
        <PageContainer>
            <Header />

            {/* Hero Section */}
            <HeroSection>
                <HeroContent>
                    <Logo src={LogoImg} alt='Logo' />
                    <Title>
                        학습자료 업로드로 시험문제를 자동 생성해보세요!
                    </Title>
                    <Subtitle>
                        필요한 만큼 간편하게, 지금 바로 시작하세요.
                    </Subtitle>
                </HeroContent>
            </HeroSection>

            {/* Upload Section */}
            <UploadSection>
                {!data && (
                    <PDFUpload
                        examData={data}
                        setExamData={setData}
                        multipleChoice={multipleChoice}
                        setMultipleChoice={setMultipleChoice}
                        shortAnswer={shortAnswer}
                        setShortAnswer={setShortAnswer}
                        essay={essay}
                        setEssay={setEssay}
                        examNumber={examNumber}
                        setExamNumber={setExamNumber}
                        prompt={prompt}
                        imagePrompt={imagePrompt}
                        isTextCentered={isTextCentered}
                        setIsTextCentered={setIsTextCentered}
                        isLectureOnly={isLectureOnly}
                        setIsLectureOnly={setIsLectureOnly}
                    />
                )}

                <CreateExam data={data} setData={setData} />
            </UploadSection>

            <FooterSection>
                <WarningText>
                    수학 문제 생성 과정에서 어려움이 있을 수 있으며,
                    <br />
                    시험 문제에 일부 오류가 포함될 가능성도 있습니다.
                </WarningText>
                <InfoFooter />
            </FooterSection>
        </PageContainer>
    );
};

export default DataUpload;

/* 스타일 정의 */
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

const HeroSection = styled.section`
    width: 100%;
    background-color: #f5f6ff;
    padding: 50px 0;
    text-align: center;
`;

const HeroContent = styled.div`
    max-width: 720px;
    margin: 0 auto;
`;

const Logo = styled.img`
    width: 180px;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    font-size: 28px;
    margin-bottom: 8px;
    font-weight: 600;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: #666;
`;

const UploadSection = styled.section`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    gap: 20px;
`;

const FooterSection = styled.footer`
    text-align: center;
`;

const WarningText = styled.p`
    font-size: 12px;
    color: #999;
    margin-bottom: 60px;
`;
