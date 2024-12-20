import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import store from './store'
import { Provider } from 'react-redux'
import './index.style.scss'
import { GlobalMessage, GlobalNotification } from './components/GlobalComponents'
// import reportWebVitals from './reportWebVitals'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode>
        <ConfigProvider locale={zhCN}>
            <Provider store={store}>
                <App />
                <GlobalMessage />
                <GlobalNotification />
            </Provider>
        </ConfigProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
