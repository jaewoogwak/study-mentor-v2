import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie';
import styled from 'styled-components';
import loadingBar from '../assets/loading';
import testPeople from '../assets/testPeople';
import exam from '../assets/exam';
import teacher from '../assets/teacher';

const ProgressBar = () => {
    const [text, setText] = useState('');
    const [subtext, setSubtext] = useState(''); 
    const [count, setCount] = useState(0);
    const [subCount, setSubCount] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [currentWord, setCurrentWord] = useState(1);
    
    const word1 = ['잠시만 기다려주세요.', '문제 생성 중입니다..'];
    const word2 = ['시험은 한 번만 제출 가능하니,', '신중하게 풀어보세요.'];
    const word3 = ['정답을 확인한 뒤,', '틀린 문제에 대한 피드백을 받으세요.'];
    const word4 = ['도움이 필요하다면,', '챗봇에게 질문하세요!'];

    const currentText = currentWord === 1 ? word1 : currentWord === 2 ? word2 : currentWord === 3 ? word3 : word4;

    const options1 = {
        loop: true,
        autoplay: true,
        animationData: loadingBar,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
        height: 130,
        width: 130   
    };

    const options2 = {
        loop: true,
        autoplay: true,
        animationData: testPeople,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
        height: 180, 
        width: 180   
    };

    const options3 = {
        loop: true,
        autoplay: true,
        animationData: exam,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
        height: 180, 
        width: 180   
    };

    const options4 = {
        loop: true,
        autoplay: true,
        animationData: teacher,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
        height: 150, 
        width: 150   
    };

    useEffect(() => {
        let interval;
        if (!deleting && count < currentText[0].length) {
            interval = setInterval(() => {
                setText(prevText => prevText + currentText[0][count]);
                setCount(count + 1);
            }, 250);
        } else if (!deleting && count >= currentText[0].length && subCount < currentText[1].length) {
            interval = setInterval(() => {
                setSubtext(prevSubtext => prevSubtext + currentText[1][subCount]);
                setSubCount(subCount + 1);
            }, 250);
        } else if (deleting) {
            // Clear text in reverse order
            interval = setInterval(() => {
                if (subCount > 0) {
                    setSubtext(prevSubtext => prevSubtext.slice(0, -1));
                    setSubCount(subCount - 1);
                } else if (count > 0) {
                    setText(prevText => prevText.slice(0, -1));
                    setCount(count - 1);
                }
            }, 50);
        }

        if (subCount === currentText[1].length && !deleting) {
            setTimeout(() => {
                setDeleting(true);
            }, 1000);
        }

        if (deleting && count === 0 && subCount === 0) {
            setDeleting(false);
            setText('');
            setSubtext('');
            setCurrentWord(currentWord === 4 ? 1 : currentWord + 1);
        }

        return () => clearInterval(interval);
    }, [count, subCount, currentWord, deleting]);

    return (
        <ProgressContainer>
            <div>
                <Lottie style={{marginBottom: '10px'}}
                    options={currentWord === 1 ? options1 : currentWord === 2 ? options2 : currentWord === 3 ? options3 : options4}
                    height={currentWord === 1 ? options1.height : currentWord === 2 ? options2.height : currentWord === 3 ? options3.height : options4.height}
                    width={currentWord === 1 ? options1.width : currentWord === 2 ? options2.width : currentWord === 3 ? options3.width : options4.width}
                />
            </div>
            <div>
                <LoadingText>{text}</LoadingText>
                <LoadingSubText>{subtext}</LoadingSubText>
            </div>
        </ProgressContainer>
    );
};

export default ProgressBar;

const ProgressContainer = styled.div`
    // padding-bottom: 30px;
    margin-top: 20px;
`;

const LoadingText = styled.div`
    font-size: 22px;
    font-family: 'Pretendard-Regular';
    padding-bottom: 5px;

    @media (max-width: 768px){
        font-size: 18px;
    }
`;

const LoadingSubText = styled.div`
    font-size: 22px;
    font-family: 'Pretendard-Regular';
    margin-bottom: 30px;

    @media (max-width: 768px){
        font-size: 18px;
    }
`;