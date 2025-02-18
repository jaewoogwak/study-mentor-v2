import React, { useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import FullPageScroll from '../components/FullPageScroll';
import FullPageHeader from '../components/FullPageHeader';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import InfoFooter from '../components/InfoFooter';

const MainPage = () => {
    return (
        <Wrapper>
            <FullPageHeader />
            <FullPageScroll />
            <InfoFooter />
        </Wrapper>
    );
};

export default MainPage;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;
