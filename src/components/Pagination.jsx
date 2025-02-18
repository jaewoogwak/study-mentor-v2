import React from 'react';
import { Pagination } from 'antd';
const PageMover = ({ pageInfo, setPage }) => {
    return (
        <Pagination
            showSizeChanger={false}
            simple
            defaultCurrent={1}
            total={pageInfo * 10}
            onChange={(page) => {
                setPage(page);
            }}
        />
    );
};
export default PageMover;
