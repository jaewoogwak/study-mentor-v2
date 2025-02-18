import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

const ScoreModal = ({ 
    isOpen, 
    onRequestClose, 
    scoreData, 
    totalQuestion }) => {
        
    const { score } = scoreData;

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                contentLabel="Score Information"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '330px', 
                        height: '250px',
                        textAlign: 'center',
                        border: '2px solid',
                        fontFamily: 'Pretendard-Regular',
                    }
                }}                
            >
                <ModalTitle>📌 시험 점수</ModalTitle>
                <ModalScore>{score} / {totalQuestion}</ModalScore>
                {score <  (totalQuestion * 0.5) ? (
                    <ModalText>조금 더 세세한 공부가 필요합니다. 🤔 <br /> 오답에 대해 학습한 뒤, 다시 문제를 풀어보세요.</ModalText>
                ) : score < (totalQuestion * 0.8) ? (
                    <ModalText>열심히 공부하셨군요! 🙂  <br /> 하지만, 조금 더 학습을 하여 고득점을 노려보세요.</ModalText>
                ) : (
                    <ModalText>열심히 공부하셨군요! 😊<br /> 열심히 한 만큼 좋은 결과가 있을 것입니다.</ModalText>
                )}
                <ModalButton onClick={onRequestClose}>닫기</ModalButton>
            </Modal>
        </div>
    );
};

export default ScoreModal;

const ModalTitle = styled.h2`
    margin: 10px;
    font-size: 30px;
    margin-bottom: 30px;
`;

const ModalScore = styled.p`
    margin: 10px;
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 30px;
`;

const ModalText = styled.h3`
    font-size: 15px;
    text-align: center;
    margin-bottom: 30px;
`;

const ModalButton = styled.button`
    font-family: "Pretendard-Regular";
    width: 80px;
    height: 30px;
    font-size: 15px;
    background: #B8E9FF;
    border: 2px #1187CF solid;
    border-radius: 5px;
    font-weight: bold;
    &:hover {
        background: #58CCFF;
    }
`;
