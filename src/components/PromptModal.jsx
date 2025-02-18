import React, { useState } from 'react';
import { Modal } from 'antd';
import PromptInput from './PromptInput';
import styled from 'styled-components';

const PromptModal = ({
    prompt,
    setPrompt,
    imagePrompt,
    setImagePrompt,
    isTextCentered,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
        // console.log(prompt);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    return (
        <>
            <StyleButton type='primary' onClick={showModal}>
                스타일 설정
            </StyleButton>
            <Modal
                title={<ModalTitle>시험문제 스타일 설정하기</ModalTitle>}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                wrapClassName="custom-modal-center"
                style={{
                    top: '10%',
                    fontFamily: 'Pretendard-Regular',
                }}
            >
                <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    imagePrompt={imagePrompt}
                    setImagePrompt={setImagePrompt}
                    isTextCentered={isTextCentered}
                />
            </Modal>
        </>
    );
};
export default PromptModal;

const StyleButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    font-family: 'Pretendard-Regular';
    border: 2px solid #2FA599;
    border-radius: 5px;
    background-color: white;
    color: black;

    &:hover,
    &:active {
        background-color: #2FA599; 
        color: white;
    }

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const ModalTitle = styled.span`
    font-size: 24px;
    font-family: 'Pretendard-Regular';

    @media (max-width: 768px) {
        font-size: 20px; // 태블릿이나 작은 화면에서 폰트 크기 줄이기
    }
`;