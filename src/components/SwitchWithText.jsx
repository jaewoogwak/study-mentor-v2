import React from 'react';
import styled from 'styled-components';

const SwitchWithText2 = ({ isTextCentered, setIsTextCentered }) => {
    return (
        <ButtonContainer>
            <StyledButton
                isActive={!isTextCentered}  
                onClick={() => setIsTextCentered(false)}
            >
                텍스트 중심
            </StyledButton>
            <StyledButton
                isActive={isTextCentered}
                onClick={() => setIsTextCentered(true)}
            >
                이미지 중심
            </StyledButton>
        </ButtonContainer>
    );
};

export default SwitchWithText2;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px; /* Space between buttons */
    margin: 20px 0;
`;

const StyledButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    font-family: 'Pretendard-Regular';
    border: 2px dashed #00C1AE;
    border-radius: 5px;
    cursor: pointer;
    background-color: ${({ isActive }) => (isActive ? '#00C1AE' : '#FFFFFF')}; 
    color: ${({ isActive }) => (isActive ? '#FFFFFF' : '#000000')}; 
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover, &:active {
        background-color: #00C1AE; 
        color: white;
    }

    @media (max-width: 768px) {
        padding: 8px 16px;
        font-size: 14px; 
    }
`;
