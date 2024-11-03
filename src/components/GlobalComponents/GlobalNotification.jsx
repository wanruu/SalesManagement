import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notification } from "antd";

const GlobalNotification = () => {
    const dispatch = useDispatch();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { notifications } = useSelector((state) => state.globalInfo);

    useEffect(() => {
        if (!notifications?.length) return;
        notifications.forEach((notification) => {
            notificationApi[notification.type](notification.content, notification.duration);
        });
        if (notifications.length > 0)
            dispatch({ type: 'globalInfo/clearNotifications' });
    }, [notifications])

    return <>{contextHolder}</>
}

export default GlobalNotification;