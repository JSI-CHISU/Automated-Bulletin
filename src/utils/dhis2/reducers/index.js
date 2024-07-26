import { combineReducers } from 'redux'
import dimensions from './dimensions.js'
import iframePluginStatus from './iframePluginStatus.js'
import itemActiveTypes from './itemActiveTypes.js'
import itemFilters from './itemFilters.js'
import selected from './selected.js'
import visualizations from './visualizations.js'

export default combineReducers({
    selected,
    visualizations,
    itemFilters,
    dimensions,
    itemActiveTypes,
    iframePluginStatus,
})