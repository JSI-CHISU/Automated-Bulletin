import log from 'loglevel'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { RENDERING_STRATEGY_SPLIT_BY_PERIOD } from '../../constants/layers.js'

class Layer extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
        isPlugin: PropTypes.bool,
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        config: PropTypes.object,
        data: PropTypes.array,
        dataFilters: PropTypes.object,
        editCounter: PropTypes.number,
        feature: PropTypes.object,
        index: PropTypes.number,
        isVisible: PropTypes.bool,
        opacity: PropTypes.number,
        openContextMenu: PropTypes.func,
    }

    static defaultProps = {
        opacity: 1,
        isVisible: true,
    }

    state = {}

    constructor(...args) {
        super(...args)
        this.setPeriod()
        this.createLayer()
    }

    componentDidUpdate(prevProps, prevState = {}) {
        const {
            id,
            data,
            index,
            opacity,
            isVisible,
            editCounter,
            dataFilters,
            feature,
        } = this.props
        const { period } = this.state
        const { period: prevPeriod } = prevState || {}
        const isEdited = editCounter !== prevProps.editCounter

        // Create new map if new id of editCounter is increased
        if (
            id !== prevProps.id ||
            data !== prevProps.data ||
            period?.id !== prevPeriod?.id ||
            dataFilters !== prevProps.dataFilters ||
            isEdited
        ) {
            // Reset period if edited
            if (isEdited) {
                this.setPeriod(this.updateLayer.bind(this))
            } else {
                this.updateLayer(dataFilters !== prevProps.dataFilters)
            }
        }

        if (index !== undefined && index !== prevProps.index) {
            this.setLayerOrder()
        }

        if (opacity !== prevProps.opacity) {
            this.setLayerOpacity()
        }

        if (isVisible !== prevProps.isVisible) {
            this.setLayerVisibility()
        }

        if (feature !== prevProps.feature) {
            this.highlightFeature(feature)
        }
    }

    componentWillUnmount() {
        this.removeLayer()
    }

    // Create new layer from config object (override in subclasses)
    async createLayer() {
        const { id, index = 0, config, opacity, isVisible } = this.props
        const { map } = this.context

        this.layer = map.createLayer({
            ...config,
            id,
            index,
            opacity,
            isVisible,
        })

        await map.addLayer(this.layer)
    }

    async updateLayer() {
        await this.removeLayer()
        await this.createLayer(true)
        this.setLayerOrder()
        this.setLayerVisibility()
    }

    // Override in subclass if needed
    setPeriod(callback) {
        if (callback) {
            callback()
        }
    }

    setLayerVisibility() {
        this.layer.setVisibility(this.props.isVisible)
    }

    setLayerOpacity() {
        this.layer.setOpacity(this.props.opacity)
    }

    setLayerOrder() {
        if (this.layer) {
            this.layer.setIndex(this.props.index)
        }
    }

    // Fit map to layer bounds
    fitBounds() {
        const { map } = this.context

        if (this.layer.getBounds) {
            map.fitBounds(this.layer.getBounds(), {
                padding: 40,
                duration: 0,
                bearing: map.getMapGL().getBearing(),
            })
        }
    }

    // Fit map to layer bounds once (when first created)
    fitBoundsOnce() {
        if (!this.isZoomed || this.context.map.getZoom() === undefined) {
            this.fitBounds()
            this.isZoomed = true
        }
    }

    async removeLayer() {
        if (this.layer) {
            const { map } = this.context

            this.layer.off('contextmenu', this.onFeatureRightClick, this)

            await map.removeLayer(this.layer)

            delete this.layer
        }
    }

    highlightFeature(feature) {
        if (this.layer.highlight) {
            this.layer.highlight(feature ? feature.id : null)
        }
    }

    render() {
        return null
    }

    onFeatureRightClick(evt) {
        const [x, y] = evt.position
        const layerConfig = { ...this.props }
        const { id: layerId, layer: layerType, renderingStrategy } = layerConfig
        const { map } = this.context
        const container = map.getContainer()
        const { left, top } = container.getBoundingClientRect()
        const isSplitView =
            renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD

        this.props.openContextMenu({
            ...evt,
            position: [x, y],
            offset: [left, top],
            layerConfig,
            layerId,
            layerType,
            isSplitView,
            map,
            container: isSplitView
                ? container.parentNode.parentNode
                : container,
        })

        this.setState({ popup: null })
    }

    // Called when a map popup is closed
    onPopupClose = () => {
        this.setState({ popup: null })
    }

    onError(error) {
        const message = error.message || error

        if (!this.context.isPlugin) {
            this.setState({ error: message })
        } else {
            log.error(message)
        }
    }

    onErrorHidden() {
        this.setState({ error: null })
    }
}

export default Layer
