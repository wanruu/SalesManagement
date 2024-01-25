import { Space, Card, Form, Switch, Table, Button } from 'antd'
import React, { useEffect, useState } from 'react'

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'


import { invoiceSettings } from '../../utils/config'


const { Item } = Form


export default function InvoiceSettingView() {
    const [ifShowDiscount, setIfShowDiscount] = useState(invoiceSettings.get('ifShowDiscount'))
    const [ifShowMaterial, setIfShowMaterial] = useState(invoiceSettings.get('ifShowMaterial'))
    const [ifShowDelivered, setIfShowDelivered] = useState(invoiceSettings.get('ifShowDelivered'))
    const [unitOptions, setUnitOptions] = useState(JSON.parse(invoiceSettings.get('unitOptions')))

    // UNIT
    const unitColumns = [
        { title: '单位', dataIndex: 'label', width: '200px' },
        { title: '状态', dataIndex: 'default', width: '150px', align: 'center', render: (_, curUnit) => 
            curUnit.default ? <b>当前默认单位</b> :
            <Button size='small' onClick={_ => {
                const newUnitData = JSON.parse(JSON.stringify(unitOptions))
                for (const unit of newUnitData) {
                    unit.default = unit.label === curUnit.label
                }
                setUnitOptions(newUnitData)
            }}>设为默认</Button>
        }
    ]
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 1, } }))
    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setUnitOptions((prev) => {
                const activeIndex = prev.findIndex((i) => i.key === active.id)
                const overIndex = prev.findIndex((i) => i.key === over?.id)
                return arrayMove(prev, activeIndex, overIndex)
            })
        }
    }
    const rowSelection = {
        selectedRowKeys: unitOptions.filter(unit => unit.showing).map(unit => unit.key),
        onChange: (selectedRowKeys, selectedRows) => {
            const newUnitData = JSON.parse(JSON.stringify(unitOptions))
            for (const unit of newUnitData) {
                unit.showing = selectedRowKeys.includes(unit.key)
            }
            setUnitOptions(newUnitData)
        },
        getCheckboxProps: (record) => ({
            name: record.name,
        })
    }
    const TableRow = (props) => {
        const { attributes, listeners, setNodeRef,
            transform, transition, isDragging
        } = useSortable({ id: props['data-row-key'] })
        const style = { ...props.style,
            transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
            transition,
            cursor: 'move',
            ...(isDragging ? { position: 'relative', zIndex: 9999 } : {})
        }
        return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
    }

    useEffect(() => {
        invoiceSettings.set('unitOptions', JSON.stringify(unitOptions))
    }, [unitOptions])


    return <Card size='small'>
        <Space direction='vertical' size={0} style={{ width: '100%' }}>
            <div className='itemTitle'>产品材质</div>
            <Form layout='inline'>
                <Item label='显示材质' extra='若开关关闭，原有数据不会发生更改，只是隐藏材质项。请勿频繁更改。'>
                    <Switch checked={ifShowMaterial === 'true'} onChange={val => {
                        setIfShowMaterial(`${val}`)
                        invoiceSettings.set('ifShowMaterial', `${val}`)
                    }} />
                </Item>
            </Form>

            <div className='itemTitle'>产品单位</div>
            <Form layout='vertical'>
                <Item label='选择显示的单位' extra='（1）勾选的单位将会显示在开单页面、产品编辑页面的单位选择列表中，不勾选则不显示。
                    （2）拖动列表项目可以为单位排序。'>
                    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                        <SortableContext items={unitOptions.map(i => i.key)} strategy={verticalListSortingStrategy}>
                            <Table size='small' rowKey='key' columns={unitColumns} dataSource={unitOptions}
                                pagination={false} components={{ body: { row: TableRow } }} 
                                rowSelection={rowSelection}
                            />
                        </SortableContext>
                    </DndContext>
                </Item>
            </Form>

            <div className='itemTitle'>折扣、配送</div>
            <Form layout='horizontal'>
                <Item label='显示折扣' extra='若开关关闭，原有数据不会发生更改，只是隐藏折扣及折前金额。请勿频繁更改。'>
                    <Switch checked={ifShowDiscount === 'true'} onChange={val => {
                        setIfShowDiscount(`${val}`)
                        invoiceSettings.set('ifShowDiscount', `${val}`)
                    }} />
                </Item>
                <Item label='显示配送'>
                    <Switch checked={ifShowDelivered === 'true'} onChange={val => {
                        setIfShowDelivered(`${val}`)
                        invoiceSettings.set('ifShowDelivered', `${val}`)
                    }} />
                </Item>
            </Form>
        </Space>
    </Card>
}