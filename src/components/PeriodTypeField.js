import React from 'react'
import { Field, SingleSelect, SingleSelectOption } from '@dhis2/ui'

const MONTH = 'month'
const QUARTER = 'quarter'
const YEAR = 'year'

export const PeriodTypeField = ({ setState, state, setSelectedPeriod }) => {

    const handleSelectPeriodType = ({ selected }) => {
        setState(selected)
        setSelectedPeriod(null)
    }

    return (
        <Field label="Period type">
            <SingleSelect
                placeholder='Period type'
                selected={state}
                onChange={handleSelectPeriodType}
            >
                <SingleSelectOption label="Monthly" value={MONTH} />
                <SingleSelectOption label="Quarterly" value={QUARTER} />
                <SingleSelectOption label="Yearly" value={YEAR} />
            </SingleSelect>
        </Field>
    )
}