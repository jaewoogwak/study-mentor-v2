import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Header from '../components/Header';
import { auth, db } from '../services/firebase'; // firebase DB 가져오기
import { useAuth } from '../contexts/AuthContext';
import InfoFooter from '../components/InfoFooter';
import {
    doc,
    updateDoc,
    getDocs,
    collection,
    query,
    where,
} from 'firebase/firestore'; // Firestore 관련 함수 가져오기

const Settings = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false); // 로딩 상태 추가
    const { user, logout } = useAuth(); // AuthContext 사용

    // 이메일 입력 시 처리
    const handleEmailChange = (e) => {
        const inputEmail = e.target.value;
        setEmail(inputEmail);
        setIsEmailTouched(true);
        setIsValidEmail(inputEmail.endsWith('@koreatech.ac.kr'));
    };

    const sendVerificationCode = async () => {
        if (!isValidEmail) {
            setMessage('학교 이메일(@koreatech.ac.kr)만 사용 가능합니다.');
            setIsError(true);
            return;
        }

        setIsSendingCode(true); // 로딩 상태 시작

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/email`,
                { email: email },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                }
            );
            setMessage(response.data.message);
            setIsError(false);
            setIsCodeSent(true);
        } catch (error) {
            setMessage('인증 코드를 보내는 중 오류가 발생했습니다.');
            setIsError(true);
        } finally {
            setIsSendingCode(false); // 로딩 상태 종료
        }
    };

    const verifyCode = async () => {
        try {
            const user = auth.currentUser;
            const userEmail = user.email;
            const q = query(
                collection(db, 'credits'),
                where('email', '==', userEmail)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((docSnapshot) => {
                    const docData = docSnapshot.data();
                    if (docData.isVerified) {
                        setMessage('이미 인증된 사용자입니다.');
                        setIsError(true);
                        throw new Error('이미 인증된 사용자');
                    }
                });
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/num`,
                { email: email, authnum: code },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                }
            );

            setMessage(response.data.message);
            setIsError(false);

            if (response.status === 200) {
                // 현재 사용자 크레딧에 10 추가
                // firestore credits 컬렉션에서 크레딧 정보를 가져와서 업데이트
                const q = query(
                    collection(db, 'credits'),
                    where('email', '==', userEmail)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((docSnapshot) => {
                        const docData = docSnapshot.data();
                        const newCredit = docData.credit + 10;
                        updateCredits(userEmail, newCredit);
                    });
                }
            }
        } catch (error) {
            if (error.message === '이미 인증된 사용자') {
                setMessage('이미 인증된 사용자입니다.');
            } else {
                console.error(error);
                setMessage(
                    '인증 코드 확인 중 오류가 발생했습니다. 다시 시도해주세요.'
                );
            }
            setIsError(true);
        }
    };

    const updateCredits = async (email, newCredit) => {
        try {
            const q = query(
                collection(db, 'credits'),
                where('email', '==', email)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach(async (docSnapshot) => {
                    const docRef = doc(db, 'credits', docSnapshot.id);
                    await updateDoc(docRef, {
                        credit: newCredit,
                        isVerified: true,
                    });
                });
                setMessage('크레딧이 성공적으로 업데이트되었습니다.');
                setIsError(false);
            } else {
                setMessage('해당 유저를 찾을 수 없습니다.');
                setIsError(true);
            }
        } catch (error) {
            setMessage('크레딧 업데이트 중 오류가 발생했습니다.');
            setIsError(true);
        }
    };

    // 로그인이 되지 않은 경우 로그인 버튼을 보여줌
    if (!user) {
        return (
            <Wrapper>
                <Header />
                <MainWrapper>
                    <ContentWrapper>
                        <h2>로그인이 필요합니다.</h2>
                        <ActionButton
                            onClick={() => (window.location.href = '/login')}
                        >
                            로그인
                        </ActionButton>
                    </ContentWrapper>
                </MainWrapper>
            </Wrapper>
        );
    }

    // 로그인이 된 경우 기존 화면을 보여줌
    return (
        <>
            <Wrapper>
                <Header />
                <InfoContainer>
                    <InfoBox>
                        <InfoText>🏫 한국기술교육대학교 이메일 인증</InfoText>
                        <TextCustom>
                            학교 이메일(@koreatech.ac.kr) 인증 시 <br />
                            무료 사용 횟수 10회를 제공합니다.
                        </TextCustom>
                    </InfoBox>
                </InfoContainer>
                <MainWrapper>
                    <ContentWrapper>
                        <h2 style={{ margin: '20px 0px 20px 0px' }}>
                            이메일 인증
                        </h2>

                        <InputField
                            type='email'
                            value={email}
                            onChange={handleEmailChange}
                            placeholder='@koreatech.ac.kr'
                            isValid={isValidEmail}
                            isTouched={isEmailTouched}
                        />
                        <ActionButton
                            onClick={sendVerificationCode}
                            disabled={!isValidEmail || isSendingCode} // 전송 중이면 버튼 비활성화
                        >
                            {isSendingCode ? '발송 중...' : '인증 코드 발송'}
                        </ActionButton>

                        {isCodeSent && (
                            <>
                                <InputField
                                    type='text'
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='인증 코드를 입력하세요'
                                />
                                <ActionButton onClick={verifyCode}>
                                    코드 확인
                                </ActionButton>
                            </>
                        )}

                        {message && (
                            <Message isError={isError}>{message}</Message>
                        )}

                        <LogoutButton
                            onClick={() => {
                                localStorage.removeItem('token');
                                auth.signOut();
                                logout();
                                window.location.href = '/login';
                            }}
                        >
                            로그아웃
                        </LogoutButton>
                    </ContentWrapper>
                </MainWrapper>
            </Wrapper>
            <InfoFooter />
        </>
    );
};

export default Settings;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0 auto;
`;

const MainWrapper = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const InfoContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 30px;

    @media (max-width: 768px) {
        margin: 20px;
    }
`;

const InfoBox = styled.div`
    width: 770px;
    padding: 30px;
    background: #fff0dd;
    border-radius: 12px;

    @media (max-width: 768px) {
        width: 90%;
        padding: 20px;
    }
`;

const InfoText = styled.h3`
    font-size: 24px;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const TextCustom = styled.p`
    font-size: 18px;
    margin-top: 10px;

    @media (max-width: 768px) {
        font-size: 14px;
        margin-top: 10px;
    }
`;

const InputField = styled.input`
    width: 400px;
    padding: 10px;
    margin: 20px 0;
    border-radius: 5px;
    border: 1px solid
        ${({ isTouched, isValid }) =>
            !isTouched ? '#ccc' : isValid ? '#4caf50' : '#f44336'};
    font-size: 16px;
    outline: none;
    background-color: ${({ isTouched, isValid }) =>
        !isTouched ? 'white' : isValid ? '#e8f5e9' : '#ffebee'};
`;

const ActionButton = styled.button`
    width: 420px;
    margin: 10px 0;
    padding: 12px;
    background-color: #3a4ca8;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    font-family: 'Pretendard-Regular';
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

    &:hover,
    &:active {
        background-color: #5d6dbe;
    }
`;

const Message = styled.p`
    color: ${({ isError }) => (isError ? '#f44336' : '#4caf50')};
    margin: 15px;
`;

const LogoutButton = styled(ActionButton)`
    background-color: #fd6f22;

    &:hover,
    &:active {
        background-color: #fc5230;
    }
`;
