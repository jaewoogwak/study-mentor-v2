// InfoFooter.jsx
import React from 'react';
import styled from 'styled-components';

const InfoFooter = () => {
    return (
        <BoxContainer>
            <FooterInfo>
                <FooterContent>
                    © 2024 Graduation Work Project In KoreaTech. All rights
                    reserved.
                </FooterContent>
                <FooterContent>
                    Contact Us:{' '}
                    <a href='mailto:study.mentor.link@gmail.com'>
                        study.mentor.link@gmail.com
                    </a>
                </FooterContent>
            </FooterInfo>
        </BoxContainer>
    );
};

export default InfoFooter;

const BoxContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 25px;
    background: #f0f0f0;
    width: 100%;
    box-sizing: border-box;

    /* margin-top 제거해서 아래쪽 여백 없애기 */
    margin-top: 0;

    @media (max-width: 768px) {
        padding: 10px;
        /* 모바일에서도 margin-top 제거 */
        margin-top: 0;
    }
`;

const FooterInfo = styled.div`
    text-align: right;
`;

const FooterContent = styled.h3`
    font-size: 13px;
    margin: 5px 0;

    @media (max-width: 768px) {
        font-size: 8px;
        margin: 3px 0;
    }
`;
