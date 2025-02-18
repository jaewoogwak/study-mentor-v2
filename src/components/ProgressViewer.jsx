import React from 'react';
import { Popover, Steps } from 'antd';
const customDot = (dot, { status, index }) => (
    <Popover
        content={
            <span>
                step {index} status: {status}
            </span>
        }
    >
        {dot}
    </Popover>
);
const description = 'You can hover on the dot.';
const ProgressViewer = () => (
    <Steps
        current={1}
        style={{ width: '70%', paddingTop: '50px' }}
        progressDot={customDot}
        items={[
            {
                title: '파일 업로드',
                description: `업로드하신 학습 자료가 서버로 전달돼요`,
            },
            {
                title: '학습 자료 분석 중',
                description: `학습 자료를 분석하고 있어요`,
            },
            {
                title: '시험 문제 생성 중',
                description: '시험 문제를 생성하고 있어요',
            },
            {
                title: 'PDF 변환 중',
                description: 'PDF로 변환하고 있어요',
            },
        ]}
    />
);
export default ProgressViewer;
