const mapViewIsThematicOrEvent = (mapView) =>
    mapView.layer.includes('thematic') || mapView.layer.includes('event')

const getFilteredMap = (visualization, filters) => {
    // apply filters only to thematic and event layers
    const mapViews = visualization.mapViews.map((mapView) => {
        if (mapViewIsThematicOrEvent(mapView)) {
            return getFilteredNonMap(mapView, filters)
        }

        return mapView
    })

    return {
        ...visualization,
        mapViews,
    }
}

const getFilteredNonMap = (visualization, filters) => {
    // deep clone objects in filters to avoid changing the visualization in the Redux store
    const visRows = visualization.rows.map((obj) => ({ ...obj }))
    const visColumns = visualization.columns.map((obj) => ({ ...obj }))
    const visFilters = visualization.filters.map((obj) => ({ ...obj }))

    Object.keys(filters).forEach((dimensionId) => {
        if (filters[dimensionId]) {
            let dimensionFound = false

            ;[visRows, visColumns, visFilters].forEach((dimensionObjects) =>
                dimensionObjects
                    .filter((obj) => obj.dimension === dimensionId)
                    .forEach((obj) => {
                        dimensionFound = true
                        obj.items = filters[dimensionId]
                    })
            )

            // add dimension to filters if not already present elsewhere
            if (!dimensionFound) {
                visFilters.push({
                    dimension: dimensionId,
                    items: filters[dimensionId],
                })
            }
        }
    })

    return {
        ...visualization,
        rows: visRows,
        columns: visColumns,
        filters: visFilters,
    }
}

const getFilteredVisualization = (visualization, filters) => {
    if (!Object.keys(filters).length) {
        return visualization
    }

    if (visualization.mapViews) {
        return getFilteredMap(visualization, filters)
    }

    return getFilteredNonMap(visualization, filters)
}

export default getFilteredVisualization