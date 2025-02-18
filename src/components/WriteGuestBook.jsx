import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const WriteGuestBook = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [nameOption, setNameOption] = useState(''); 
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nameOption) {
            alert('이름을 선택해주세요.');
            return;
        }
        if (nameOption === 'nickname' && !name) {
            alert('별칭을 입력해주세요.');
            return;
        }
        if (!message) {
            alert('메시지를 입력해주세요.');
            return;
        }

        const displayName = nameOption === 'anonymous' ? '익명' : name;
        const newEntry = {
            name: displayName,
            message,
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, 'guestbook'), newEntry); 
            setName(''); 
            setMessage('');
            setNameOption('anonymous');
            setSubmitSuccess(true);
            setSubmitError(null);
        } catch (error) {
            console.error('문서 추가 오류:', error);
            setSubmitError('방명록 저장에 실패하였습니다.');
            setSubmitSuccess(false);
        }
    };

    useEffect(() => {
        if (submitSuccess) {
            alert('방명록이 성공적으로 저장되었습니다.');
            window.location.reload(); // 페이지 새로 고침
        }
    }, [submitSuccess]);

    return (
        <Wrapper>
            <BookContainer onSubmit={handleSubmit}>
                <NameContainer>
                    <HeadingText>Step 1.</HeadingText>
                    <CustomText>표시될 이름을 정해주세요.</CustomText>
                    <Namelabel>
                        <input
                            type="radio"
                            value="anonymous"
                            checked={nameOption === 'anonymous'}
                            onChange={() => setNameOption('anonymous')}
                        />
                        익명
                    </Namelabel>
                    <Namelabel>
                        <input
                            type="radio"
                            value="nickname"
                            checked={nameOption === 'nickname'}
                            onChange={() => setNameOption('nickname')}
                        />
                        별칭
                    </Namelabel>
                </NameContainer>

                {nameOption === 'nickname' && (
                    <>
                        <CustomText>별칭을 입력해주세요. (5글자 이내)</CustomText>
                        <StyledInput
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={1}
                            maxLength={5}
                        />
                    </>
                )}

                <TextContainer>
                    <HeadingText>Step 2.</HeadingText>
                    <CustomText>하고 싶은 말을 남겨주세요. (최소 10, 최대 200글자)</CustomText>
                    <StyledTextarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={200}
                        minLength={10}
                    />
                </TextContainer>
                
                <WarningMessage>저장 후 삭제는 불가합니다.</WarningMessage>
                <SubmitButton>남기기</SubmitButton>
            </BookContainer>
        </Wrapper>
    );
};

export default WriteGuestBook;

const Wrapper = styled.div`
    padding: 10px 35px;
    background-color: #B8E9FF;
    border-radius: 10px;
    width: 100%;
    max-width: 750px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 10px;
        width: 90%;
    }
`;


const BookContainer = styled.form`
    padding: 20px 0px;
`;

const NameContainer = styled.div`
    flex-direction: row;
`;

const HeadingText = styled.p`
    font-weight: 600;
    font-size: 23px;
    margin: 10px 0px;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const CustomText = styled.p`
    font-size: 22px;
    margin: 20px 0px;

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const StyledInput = styled.input`
    width: 100%;
    max-width: 120px;
    padding: 5px;
    font-size: 18px;
    font-family: 'GmarketSansMedium', sans-serif;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;

    @media (max-width: 768px) {
        max-width: 100px;
        font-size: 14px;
        padding: 4px;
    }
`;

const Namelabel = styled.label`
    font-size: 20px;
    font-family: "Pretendard-Regular";
    margin: 30px;

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const TextContainer = styled.div`
    margin: 30px 0px;
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    max-width: 700px;
    height: 200px;
    font-size: 16px;
    font-family: 'GmarketSansMedium', sans-serif;
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    box-sizing: border-box;

    @media (max-width: 768px) {
        height: 150px;
        font-size: 14px;
    }
`;

const WarningMessage = styled.p`
    font-size: 15px;
    margin-top: 20px;
    color: #D94925;
`;

const SubmitButton = styled.button`
    font-family: 'Pretendard-Regular';
    padding: 10px 25px;
    border: none;
    border-radius: 4px;
    background-color: #18A8F1;
    color: white;
    cursor: pointer;
    font-size: 16px;  
    margin: 15px 0px;

    &:hover {
        background-color: #1187CF;
    }

    @media (max-width: 768px) {
        font-size: 14px; 
    }
`;
