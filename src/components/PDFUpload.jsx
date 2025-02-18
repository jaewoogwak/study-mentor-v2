import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { message } from 'antd'; // antd의 message만 사용
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import {
    getStorage,
    ref,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

import ProgressBar from '../components/progressBar';
import PDFViewer from './PDFViewer';

const PDFUpload = ({
    examData,
    setExamData,
    multipleChoice,
    shortAnswer,
    essay,
    examNumber,
    prompt,
    imagePrompt,
    isTextCentered,
    isLectureOnly,
}) => {
    const { user } = useAuth();

    const [fileState, setFileState] = useState(null); // null, 'uploading', 'done', 'error'
    const [fileType, setFileType] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [processState, setProcessState] = useState('');

    // 파이어베이스 스토리지에서 기존 PDF 불러오기
    useEffect(() => {
        const downloadFile = async () => {
            try {
                if (user) {
                    const storage = getStorage();
                    const fileName = user.email.split('@')[0];
                    const storageRef = ref(
                        storage,
                        'pdfs/' + fileName + '.pdf'
                    );
                    const url = await getDownloadURL(storageRef);
                    const response = await fetch(url);
                    const blob = await response.blob();
                    setPdfFile(blob);
                    setFileState('done');
                }
            } catch (error) {
                // 파일 없으면 무시
            }
        };

        downloadFile();
    }, [user]);

    // react-dropzone의 onDrop
    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (!acceptedFiles || acceptedFiles.length === 0) return;
            const file = acceptedFiles[0];

            // 파일 크기 체크
            if (file.size > 50_000_000) {
                message.error('파일 크기는 50MB 이하여야 합니다.');
                setFileState('error');
                return;
            }

            setFileState('uploading');
            setProcessState('파일 업로드 중입니다...');

            // 폼데이터 구성
            const formData = new FormData();
            const examSetting = {
                multipleChoice: multipleChoice || 2,
                shortAnswer: shortAnswer || 2,
                essay,
                examNumber,
                custom_prompt: prompt,
                custom_image_prompt: imagePrompt,
                isTextCentered,
                isLectureOnly,
            };

            formData.append('file', file);
            formData.append('examSetting', JSON.stringify(examSetting));

            // pdf or image 구분
            const type =
                file.type === 'application/pdf'
                    ? '/upload/pdf'
                    : '/upload/image';

            // 인증 토큰
            let token = '';
            if (user) {
                token = await user.getIdToken();
            } else {
                token = localStorage.getItem('token');
            }

            axios({
                url: `${import.meta.env.VITE_API_URL}${type}`,
                method: 'POST',
                responseType: 'json',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                data: formData,
            })
                .then((response) => {
                    setFileState('done');
                    setFileType('pdf');
                    setExamData(response.data);
                    localStorage.setItem(
                        'examData',
                        JSON.stringify(response.data)
                    );
                    setProcessState('');
                })
                .catch((error) => {
                    console.error('Error:', error);
                    message.error('파일 업로드 실패');
                    setFileState('error');
                    setProcessState('');
                });
        },
        [
            multipleChoice,
            shortAnswer,
            essay,
            examNumber,
            prompt,
            imagePrompt,
            isTextCentered,
            isLectureOnly,
            user,
            setExamData,
        ]
    );

    // Dropzone 훅
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': [],
        },
    });

    // 문제 새로 생성하기
    const handleReset = async () => {
        try {
            const storage = getStorage();
            const fileName = user.email.split('@')[0];
            const storageRef = ref(storage, 'pdfs/' + fileName + '.pdf');

            await deleteObject(storageRef);
            setFileState(null);
            setPdfFile(null);
            setFileType(null);
            setExamData(null);
            localStorage.removeItem('examData');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (fileState === 'uploading') {
        return (
            <StatusWrapper>
                <ProgressBar />
                <StatusText>{processState}</StatusText>
            </StatusWrapper>
        );
    }

    if (fileState === 'done') {
        return (
            <PDFViewerWrapper>
                <ResetButton onClick={handleReset}>
                    문제 새로 생성하기
                </ResetButton>
                <StatusWrapper>
                    {pdfFile ? (
                        <PDFViewer path={pdfFile} scale={1.4} />
                    ) : (
                        <StatusText>PDF 미리보기 로드 실패</StatusText>
                    )}
                </StatusWrapper>
            </PDFViewerWrapper>
        );
    }

    if (fileState === 'error') {
        return (
            <StatusWrapper>
                <StatusText>⛔ 파일 업로드에 실패했습니다.</StatusText>
                <StatusText>새로고침 후 다시 시도해주세요.</StatusText>
            </StatusWrapper>
        );
    }

    // 기본상태: 드래그앤드롭 Zone
    return (
        <DropZoneWrapper {...getRootProps()}>
            <input {...getInputProps()} />
            <IconArea>📂</IconArea>
            {isDragActive ? (
                <DragText>이곳에 파일을 놓으세요...</DragText>
            ) : (
                <>
                    <DragText>
                        클릭하거나 파일을 드래그하여 업로드하세요
                    </DragText>
                    <HintText>
                        PDF 또는 이미지를 최대 50MB까지 업로드할 수 있습니다.
                    </HintText>
                </>
            )}
        </DropZoneWrapper>
    );
};

export default PDFUpload;

/* 스타일 정의 */
const DropZoneWrapper = styled.div`
    width: 700px;
    height: 180px;
    border: 2px dashed #ddd;
    border-radius: 12px;
    background-color: #fcfcff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: center;

    &:hover {
        background-color: #f0f0ff;
    }

    @media (max-width: 768px) {
        width: 90%;
        height: 200px;
    }
`;

const IconArea = styled.div`
    font-size: 36px;
    margin-bottom: 10px;
`;

const DragText = styled.p`
    font-size: 16px;
    margin: 0;
    font-weight: 500;
`;

const HintText = styled.p`
    font-size: 12px;
    color: #999;
    margin: 5px 0 0 0;
`;

const PDFViewerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const ResetButton = styled.button`
    font-size: 16px;
    color: #fff;
    background-color: #6c63ff;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    cursor: pointer;
    margin-bottom: 20px;

    &:hover {
        background-color: #5048c5;
    }
`;

const StatusWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
`;

const StatusText = styled.div`
    font-size: 16px;
    margin: 10px 0;
    text-align: center;
`;
