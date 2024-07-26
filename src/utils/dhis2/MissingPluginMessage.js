import i18n from '@dhis2/d2-i18n'
import { Center } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react';
import { getAppName } from './modules/itemTypes.js'
import classes from './styles/Visualization.module.css'

const MissingPluginMessage = ({ itemType, dashboardMode }) => {
    return (
        <Center>
            <p className={classes.errorMessage}>
                {i18n.t('The plugin for rendering this item is not available')}
            </p>
        </Center>
    )
}

MissingPluginMessage.propTypes = {
    dashboardMode: PropTypes.string,
    itemType: PropTypes.string,
}

export default MissingPluginMessage