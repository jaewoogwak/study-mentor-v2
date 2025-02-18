import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import { Button, ConfigProvider, Space } from 'antd';
const colors1 = ['#6253E1', '#04BEFE'];
const colors2 = ['#fc6076', '#ff9a44', '#ef9d43', '#e75516'];
const colors3 = ['#40e495', '#30dd8a', '#2bb673'];
const getHoverColors = (colors) =>
    colors.map((color) => new TinyColor(color).spin(30).lighten(10).saturate(20).toString());
const getActiveColors = (colors) =>
    colors.map((color) => new TinyColor(color).darken(5).toString());

const PDFGenerateButton = ({ text, onClickHandle }) => (
    <Space>
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        colorPrimary: `linear-gradient(135deg, ${colors1.join(
                            ', '
                        )})`,
                        colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(
                            colors1
                        ).join(', ')})`,
                        colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(
                            colors1
                        ).join(', ')})`,
                        lineWidth: 0,
                        fontFamily: 'Pretendard-Regular', 
                    },
                },
            }}
        >
            <Button type='primary' size='large' onClick={onClickHandle}>
                {text}
            </Button>
        </ConfigProvider>
    </Space>
);
export default PDFGenerateButton;
