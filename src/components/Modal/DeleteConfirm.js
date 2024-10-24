import React from 'react'
import { Modal } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import './confirm.style.scss'


const DeleteConfirm = (props) => {
    const { title, content = '确认删除后不可撤销。', ...restProps } = props
    
    return <Modal {...restProps} closable={false} width={416}
        okButtonProps={{ danger: true, ghost: true, title: '删除' }}>
        <div className='my-confirm-container'>
            <ExclamationCircleFilled className='my-icon' />
            <div className='my-main-container'>
                <div className='my-title'>
                    {title}
                </div>
                <div>{content}</div>
            </div>
        </div>
    </Modal>
}


export default DeleteConfirm