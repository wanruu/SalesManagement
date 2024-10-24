import { Form, Input } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import './editable.style.scss'


/**
 * @component
 * @param {Object} props 
 * @param {string} props.dataIndex
 * @param {Object} props.record
 * @param {Array} props.rules
 * @param {Function} props.handleSave
 */
const EditableItem = (props) => {
    const { dataIndex, record, handleSave, rules = [], ...restProps } = props

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

    return (
        <Form form={form}>
            {editing ?
                <Form.Item name={dataIndex} rules={rules} {...restProps}>
                    <Input ref={inputRef} onPressEnter={save} onBlur={save} />
                </Form.Item> :
                <Form.Item {...restProps} shouldUpdate>
                    {() =>
                        <div onClick={toggleEdit} className='editable-item-value-wrap'>
                            {record[dataIndex]}
                        </div>
                    }
                </Form.Item>
            }
        </Form>
    )
}


export default EditableItem