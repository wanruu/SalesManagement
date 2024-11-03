import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd";

const GlobalMessage = () => {
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const { messages } = useSelector((state) => state.globalInfo);

    useEffect(() => {
        if (!messages?.length) return;
        messages.forEach((msg) => {
            messageApi[msg.type](msg);
        });
        if (messages.length > 0)
            dispatch({ type: 'globalInfo/clearMessages' });
    }, [messages])

    return <>{contextHolder}</>
}

export default GlobalMessage;