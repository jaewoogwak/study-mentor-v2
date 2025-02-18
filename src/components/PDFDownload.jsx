import React from 'react';
import styled from 'styled-components';

const PDFDownload = () => {
    return (
        <DownloadBtn
            onClick={() => {
                const downloadUrl = window.URL.createObjectURL(
                    new Blob([pdfFile])
                );
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', 'study-mentor.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }}
        >
            문제 저장하기
        </DownloadBtn>
    );
};

export default PDFDownload;

const DownloadBtn = styled.button`
    width: 100%;
    height: 100%;
    font-size: 24px;
    color: #ab41ff;
    text-decoration: none;
    cursor: pointer;
    border: none;
    background-color: white;
    margin-top: 20px;
    &:hover {
        color: #ff6b6b;
    }
`;
