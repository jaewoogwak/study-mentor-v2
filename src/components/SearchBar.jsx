import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.input`
    display: flex;
    width: 100%;
    height: 52px;
    border-radius: 16px;
    border: 1px solid #eaeaea;
    justify-content: center;
    align-items: center;
    padding-left: 20px;
    font-size: 16px;
    color: #00000057;
    font-family: 'Pretendard-Regular';

    @media (max-width: 768px) {
        height: 40px;
        font-size: 14px;
        padding-left: 15px;
    }
`;

const SearchBar = ({ placeholder, onSend }) => {
    const [search, setSearch] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSend(search);
            setSearch(''); // Optionally, clear the input after sending
        }
    };

    return (
        <>
            <Wrapper
                type='text'
                placeholder={placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </>
    );
};

export default SearchBar;
