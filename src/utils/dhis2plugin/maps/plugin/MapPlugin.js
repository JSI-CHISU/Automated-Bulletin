import { CachedDataQueryProvider } from '@dhis2/analytics'
import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../constants/settings.js'
import { getHiddenPeriods } from '../util/periods.js'
import LoadingMask from '../../LoadingMask.js'
import MapContainer from './MapContainer.js'

const d2Config = {
    schemas: [
        'dataElement',
        'dataSet',
        'externalMapLayer',
        'indicator',
        'legendSet',
        'map',
        'optionSet',
        'organisationUnitGroup',
        'organisationUnitGroupSet',
        'organisationUnitLevel',
        'programStage',
    ],
}

const query = {
    systemSettings: {
        resource: 'systemSettings',
        params: {
            key: SYSTEM_SETTINGS,
        },
    },
}

const providerDataTransformation = ({ systemSettings }) => {
    return {
        systemSettings: Object.assign(
            {},
            DEFAULT_SYSTEM_SETTINGS,
            systemSettings,
            {
                hiddenPeriods: getHiddenPeriods(systemSettings),
            }
        ),
    }
}

export const MapPlugin = ({ visualization, displayProperty, width,height }) => {

    return (
        <D2Shim d2Config={d2Config}>
            {({ d2, d2Error }) => {
                if (!d2 && !d2Error) {
                    return <LoadingMask />
                }

                return (
                    <CachedDataQueryProvider
                        query={query}
                        dataTransformation={providerDataTransformation}
                    >
                        <MapContainer
                            visualization={visualization}
                            displayProperty={displayProperty}
                            width={width}
                            height={height}
                        />
                    </CachedDataQueryProvider>
                )
            }}
        </D2Shim>
    )
}

MapPlugin.propTypes = {
    displayProperty: PropTypes.string,
    visualization: PropTypes.object,
}
