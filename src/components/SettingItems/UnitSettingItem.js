import React, { useState, useRef, useContext, useEffect, useMemo } from 'react'
import { Form, Input, Table, Button, Space, Popconfirm } from 'antd'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './UnitSettingItem.scss'


const EditableContext = React.createContext(null)

const TableRow = (props) => {
    const { attributes, listeners, setNodeRef,
        transform, transition, isDragging
    } = useSortable({ id: props['data-row-key'] })
    const [form] = Form.useForm()

    const style = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {})
    }
    return <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
        </EditableContext.Provider>
    </Form>
}

const UnitSettingItem = ({ units, defaultUnit, onUnitsChange, onDefaultUnitChange }) => {    
    const unitOptions = useMemo(() => {
        return units.map(u => ({ key: u, value: u }))
    }, [units]) 
    
    // Columns
    const defaultColumns = [
        { title: '序号', render: (_, __, idx) => idx+1 },
        { title: '单位', dataIndex: 'value', editable: true, width: '30%' },
        {
            title: '状态', render: (_, curUnit) => (
                curUnit.value === defaultUnit ? <b>当前默认单位</b> :
                <Button size='small' onClick={_ => onDefaultUnitChange?.(curUnit.value)}>
                    设为默认
                </Button>
            )
        },
        { title: '操作', render: (_, unit) => 
            units.length >= 2 ? (
                <Popconfirm title="确认删除吗?" onConfirm={() => handleDelete(unit.key)}>
                    <a>删除</a>
                </Popconfirm>
            ) : null,
        }
    ].map(i => ({ ...i, align: 'center' }))

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    // Drag
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 1, } }))
    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            const newUnitOptions = ((prev) => {
                const activeIndex = prev.findIndex((i) => i.key === active.id)
                const overIndex = prev.findIndex((i) => i.key === over?.id)
                return arrayMove(prev, activeIndex, overIndex)
            })(unitOptions)
            onUnitsChange(newUnitOptions.map(o => o.value))
        }
    }

    // Edit
    const EditableCell = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        ...restProps
    }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef(null);
        const form = useContext(EditableContext);
        useEffect(() => {
            if (editing) {
                inputRef.current?.focus();
            }
        }, [editing]);
        const toggleEdit = () => {
            setEditing(!editing);
            form.setFieldsValue({ [dataIndex]: record[dataIndex] });
        };
        const save = async () => {
            try {
                const values = await form.validateFields();
                toggleEdit();
                handleSave({ ...record, ...values });
            } catch (errInfo) {
                console.log('Save failed:', errInfo);
            }
        };
        let childNode = children;
        if (editable) {
            childNode = editing ? (
                <Form.Item style={{  margin: 0, }} name={dataIndex}
                    rules={[
                        { required: true, message: `请输入${title}` },
                        { validator: async (rule, value) => {
                            if (record.key !== record.value && units.includes(value)) throw new Error('单位重复')
                        } }
                    ]}>
                    <Input ref={inputRef} onPressEnter={save} onBlur={save} />
                </Form.Item>
            ) : (
                <div className="editable-cell-value-wrap"
                    style={{ paddingInlineEnd: 24, }}
                    onClick={toggleEdit}>
                    {children}
                </div>
            );
        }
        return <td {...restProps}>{childNode}</td>;
    }

    // Handlers
    const handleSave = (row) => {
        const newUnits = units.map(unit =>
            unit === row.key ? row.value : unit
        )
        onUnitsChange?.(newUnits)
        if (defaultUnit === row.key) {
            onDefaultUnitChange?.(row.value)
        }
    }

    const handleAdd = () => {
        const numbers = units.map(unit => {
            const matches = unit.match(/单位(\d+)/)
            return parseInt(matches?.[1] ?? 0)
        })
        const nextIdx = Math.max(...numbers) + 1
        onUnitsChange?.([...units, `单位${nextIdx}`])
    }

    const handleDelete = (key) => {
        const newUnits = units.filter(u => u !== key)
        onUnitsChange?.(newUnits)
        if (!newUnits.includes(defaultUnit)) {
            onDefaultUnitChange?.(newUnits[0])
        }
    }

    return (
        <Space direction='vertical' style={{width: '100%'}}>
            <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext items={units} strategy={verticalListSortingStrategy}>
                    <Table size='small' columns={columns} dataSource={unitOptions}
                        pagination={false} components={{ body: { row: TableRow, cell: EditableCell } }}
                        footer={_ =>
                            <Button size='small' onClick={handleAdd}>新增</Button>
                        }
                    />
                </SortableContext>
            </DndContext>
            <div style={{ color: 'gray' }}>
                拖动列表项目可以为单位排序。
            </div>
        </Space>
    )
}


export default UnitSettingItem