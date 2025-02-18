import React from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Switch, Space, ConfigProvider } from 'antd';
import '../styles/App.css';
import styled from 'styled-components';

const ExamGenToggle = ({ isLectureOnly, setIsLectureOnly }) => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Switch: {
                        // handleSize: '22px',
                        trackPadding: '6px',
                    },
                },
            }}
        >
            <Space direction='vertical'>
                <Switch
                    checkedChildren={
                        <div
                            style={{
                                fontSize: '16px',
                            }}
                        >
                            강의자료에서만 문제 생성하기
                        </div>
                    }
                    unCheckedChildren={
                        <div
                            style={{
                                fontSize: '16px',
                            }}
                        >
                            외부자료를 참고하여 문제 생성하기
                        </div>
                    }
                    defaultChecked
                    style={{
                        backgroundColor: isLectureOnly ? '#5D6DBE' : '#2FA599',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '5px 3px',
                        height: '30px',
                        fontFamily: 'Pretendard-Regular',
                        // 중앙 정렬
                    }}
                    checked={isLectureOnly}
                    onChange={setIsLectureOnly}
                />
            </Space>
        </ConfigProvider>
    );
};
export default ExamGenToggle;
