import { useCacheableSection, CacheableSection } from '@dhis2/app-runtime'
import { CssVariables, CenteredContent, CircularLoader, Layer } from '@dhis2/ui'
import postRobot from '@krakenjs/post-robot'
import debounce from 'lodash/debounce'
import PropTypes from 'prop-types'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { VisualizationPluginWrapper } from './VisualizationPluginWrapper.js'

const LoadingMask = () => {
    return (
        <Layer>
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        </Layer>
    )
}

const CacheableSectionWrapper = ({
    id,
    children,
    cacheNow,
    isParentCached,
}) => {
    const { startRecording, isCached, remove } = useCacheableSection(id)

    useEffect(() => {
        if (cacheNow) {
            startRecording({ onError: console.error })
        }

        // NB: Adding `startRecording` to dependencies causes
        // an infinite recording loop as-is (probably need to memoize it)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheNow])

    useEffect(() => {
        const listener = postRobot.on(
            'removeCachedData',
            // todo: check domain too; differs based on deployment env though
            { window: window.parent },
            () => remove()
        )

        return () => listener.cancel()
    }, [remove])

    useEffect(() => {
        // Synchronize cache state on load or prop update
        // -- a back-up to imperative `removeCachedData`
        if (!isParentCached && isCached) {
            remove()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isParentCached])

    return (
        <CacheableSection id={id} loadingMask={LoadingMask}>
            {children}
        </CacheableSection>
    )
}
CacheableSectionWrapper.propTypes = {
    cacheNow: PropTypes.bool,
    children: PropTypes.node,
    id: PropTypes.string,
    isParentCached: PropTypes.bool,
}

const sendInstallationStatus = (installationStatus) => {
    postRobot.send(window.parent, 'installationStatus', { installationStatus })
}

const PluginWrapper = ({ id }) => {
    const [propsFromParent, setPropsFromParent] = useState()
    const [renderId, setRenderId] = useState(null)

    const receivePropsFromParent = (event) => setPropsFromParent(event.data)

    useEffect(() => {
        postRobot
            .send(window.parent, 'getProps')
            .then(receivePropsFromParent)
            .catch((err) => console.error(err))

        // Get & send PWA installation status now, and also prepare to send
        // future updates (installing/ready)
        /*getPWAInstallationStatus({
            onStateChange: sendInstallationStatus,
        }).then(sendInstallationStatus)*/

        // Allow parent to update props
        const listener = postRobot.on(
            'newProps',
            { window: window.parent /* Todo: check domain */ },
            receivePropsFromParent
        )

        return () => listener.cancel()
    }, [])

    useLayoutEffect(() => {
        const updateRenderId = debounce(
            () =>
                setRenderId((renderId) =>
                    typeof renderId === 'number' ? renderId + 1 : 1
                ),
            300
        )

        window.addEventListener('resize', updateRenderId)

        return () => window.removeEventListener('resize', updateRenderId)
    }, [])

    return propsFromParent ? (
        <div
            style={{
                display: 'flex',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <CacheableSectionWrapper
                id={propsFromParent.cacheId}
                cacheNow={propsFromParent.recordOnNextLoad}
                isParentCached={propsFromParent.isParentCached}
            >
                <VisualizationPluginWrapper
                    id={renderId}
                    {...propsFromParent}
                />
            </CacheableSectionWrapper>
            <CssVariables colors spacers elevations />
        </div>
    ) : null
}

export default PluginWrapper