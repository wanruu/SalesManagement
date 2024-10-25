import { Form, Input } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import './editable.style.scss'


const defaultRules = [{ whitespace: true }]

/**
 * @component
 * @param {Object} props 
 * @param {string} props.dataIndex
 * @param {Object} props.record
 * @param {Array} props.rules
 * @param {Function} props.handleSave
 */
const EditableItem = (props) => {
    const { dataIndex, record, handleSave, rules = defaultRules, label, ...restProps } = props

    const [form] = Form.useForm()
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (err) {
            console.log('Save failed:', err);
        }
    }

    const itemConfig = {
        style: { margin: 0, width: '100%' },
        labelCol: {
            span: 6 
        },
        wrapperCol: {
            span: 18
        },
    }
    return (
        <Form form={form} layout='inline' >
            {editing ?
                <Form.Item name={dataIndex} label={label} rules={rules} {...itemConfig}  {...restProps}>
                    <Input ref={inputRef} onPressEnter={save} onBlur={save}
                        placeholder={`请输入${label}`} />
                </Form.Item> :
                <Form.Item label={label} {...itemConfig} {...restProps}>
                    <div onClick={toggleEdit} className='editable-item-value-wrap'>
                        {record[dataIndex] || <span style={{ color: 'lightgray' }}>暂无数据</span>}
                    </div>
                </Form.Item>
            }
        </Form>
    )
}


export default EditableItem