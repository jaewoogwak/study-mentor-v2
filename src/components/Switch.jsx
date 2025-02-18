import React from 'react';
import { Switch } from 'antd';

const App = () => {
    const onChange = (checked) => {
        // console.log(`switch to ${checked}`);
    };
    return <Switch defaultChecked onChange={onChange} />;
};
export default App;
