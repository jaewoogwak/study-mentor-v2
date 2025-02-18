import { InputNumber } from 'antd';
import React from 'react';

const onChange = (value) => {};
const ExamNumberInput = ({ min, max, defaultValue, value }) => (
    <InputNumber
        min={min}
        max={max}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
    />
);
export default ExamNumberInput;
