import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import PageMover from './Pagination';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ path, scale }) => {
    // console.log('path', path);

    const [numPages, setNumPages] = useState(0);
    const [index, setIndex] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }) => {
        // console.log(numPages, '!!!');
        setNumPages(numPages);
    };

    const onDocumentError = (error) => {
        console.error('pdf viewer error', error);
    };

    const onDocumentLocked = () => {
        console.error('pdf locked');
    };

    const setPage = (page) => {
        setIndex(page);
    };

    useEffect(() => {
        // console.log('pdf viewer useEffect');
    }, [
        path,
        scale,
        numPages,
        index,
        onDocumentLoadSuccess,
        onDocumentError,
        onDocumentLocked,
        setPage,
    ]);

    return (
        <Document
            file={path}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentError}
            onPassword={onDocumentLocked}
        >
            <StyledPDFViewer>
                {numPages && (
                    <PageMover pageInfo={numPages} setPage={setPage} />
                )}

                <Page
                    key={`page_${index}`}
                    // className={styles.page}
                    pageNumber={index}
                    width={700}
                    renderAnnotationLayer={false}
                    scale={scale}
                    renderTextLayer={false}
                />
            </StyledPDFViewer>
        </Document>
    );
};

export default PDFViewer;

const StyledPDFViewer = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px; /* 조절 가능한 간격 */
    justify-content: center;
    align-items: center;
    padding-top: 50px;
`;
