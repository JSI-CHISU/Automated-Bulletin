import PropTypes from 'prop-types'
import { useEffect } from 'react'
import thematicLoader from '../../loaders/thematicLoader.js';
import { useDataEngine } from '@dhis2/app-runtime'

const ThematicLoader = ({ config, onLoad }) => {
    const engine = useDataEngine();
    useEffect(() => {
        thematicLoader(config,engine).then(onLoad)
    }, [config, onLoad,engine])

    return null
}

ThematicLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ThematicLoader
