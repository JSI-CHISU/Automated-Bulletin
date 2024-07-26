import React from 'react'
import { DatePicker } from 'antd'
import { Field } from '@dhis2/ui'

export const PeriodField = ({ selectedPeriodType, selectedPeriod, setSelectedPeriod }) => {

    return (
        <Field label="Period">
            <DatePicker size='large' picker={selectedPeriodType} placeholder='Period' style={{ width: '100%' }} value={selectedPeriod} onChange={period => setSelectedPeriod(period)} />
        </Field>
    )
}