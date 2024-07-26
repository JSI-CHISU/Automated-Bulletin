import { CenteredContent, CircularLoader, ComponentCover } from '@dhis2/ui'
import React, { useCallback, useEffect, useState } from 'react'
import { VisualizationPlugin } from './VisualizationPlugin.js'
import { useDataQuery } from '@dhis2/app-runtime'
import { MapPlugin } from './maps/plugin/MapPlugin.js';

const query = (id, type)=>{
        return({
            visualizations:{
                resource: (type === 'MAP'?`maps/${id}`:`visualizations/${id}`),
                params:{
                    fields:
                        type === 'MAP'?
                        "id,user,displayName~rename(name),description,longitude,latitude,zoom,basemap,publicAccess,created,lastUpdated,access,update,manage,delete,href, mapViews[*,columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],organisationUnits[id,path],dataDimensionItems,program[id,displayName~rename(name)],programStage[id,displayName~rename(name)],legendSet[id,displayName~rename(name)],trackedEntityType[id,displayName~rename(name)],organisationUnitSelectionMode,!href,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!sortOrder,!topLimit]"
                        :
                        "access,aggregationType,axes,colSubTotals,colTotals,colorSet,columns[dimension,filter,legendSet[id,name,displayName,displayShortName],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]],completedOnly,created,cumulative,cumulativeValues,dataDimensionItems[dataDimensionItemType,expressionDimensionItem[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],dataElement[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],dataElementOperand[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],reportingRate[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],programAttribute[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],programIndicator[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],indicator[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]],description,digitGroupSeparator,displayDensity,displayDescription,displayName,displayShortName,favorite,favorites,filters[dimension,filter,legendSet[id,name,displayName,displayShortName],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]],fixColumnHeaders,fixRowHeaders,fontSize,fontStyle,hideEmptyColumns,hideEmptyRowItems,hideEmptyRows,hideSubtitle,hideTitle,href,icons,id,interpretations[id,created],lastUpdated,lastUpdatedBy,legend[showKey,style,strategy,set[id,name,displayName,displayShortName]],measureCriteria,name,noSpaceBetweenColumns,numberType,outlierAnalysis,parentGraphMap,percentStackedValues,publicAccess,regression,regressionType,reportingParams,rowSubTotals,rowTotals,rows[dimension,filter,legendSet[id,name,displayName,displayShortName],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]],series,seriesKey,shortName,showData,showDimensionLabels,showHierarchy,skipRounding,sortOrder,subscribed,subscribers,subtitle,timeField,title,topLimit,translations,type,user[name,displayName,displayShortName,userCredentials[username]],userAccesses,userGroupAccesses,yearlySeries,!attributeDimensions,attributeValues,!category,!categoryDimensions,!categoryOptionGroupSetDimensions,!code,!columnDimensions,!dataElementDimensions,!dataElementGroupSetDimensions,!externalAccess,!filterDimensions,!itemOrganisationUnitGroups,!organisationUnitGroupSetDimensions,!organisationUnitLevels,!organisationUnits,!periods,!programIndicatorDimensions,!relativePeriods,!rowDimensions,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren"
                        
                    
                }
            }
        });
}
// handle internal state for features that need to work without the app's Redux store
const VisualizationPluginWrapper = (props) => {
    const { cid, type,width,height } = props;
    const { data, loading } = useDataQuery(query(cid, type));
    const [pluginProps, setPluginProps] = useState(props)
    const [isLoading, setIsLoading] = useState(true)
    const [item, setItem] = useState(null);

    const onLoadingComplete = () => setIsLoading(false);

    const onDataSorted = useCallback(
        (sorting) => {
            setIsLoading(true)

            const newSorting = {
                dimension: sorting.dimension,
                direction: sorting.direction.toUpperCase(),
            }

            setPluginProps({
                ...pluginProps,
                visualization: {
                    ...pluginProps.visualization,
                    sorting: [newSorting],
                },
            })
        },
        [pluginProps]
    )
    
    useEffect(()=>{
        if(!loading){
            setItem(data?.visualizations || {});
        }
    },[loading, data?.visualizations]);

    useEffect(() => {
       // setIsLoading(true)
        setPluginProps(props)
    }, [props]);

    if(type === 'MAP'){
        return (
            <>
                {
                    !loading && item?(
                        <MapPlugin
                        {...pluginProps}
                        visualization = { item }
                        width={width}
                        height={height}
                        />
                    ):null
                }
            </>
        )    
    }
    return (
        <>
            {isLoading && (
                <ComponentCover>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </ComponentCover>
            )}
            {!loading && item?(
                    <VisualizationPlugin
                        {...pluginProps}
                        visualization = { item }
                        onDataSorted={onDataSorted}
                        onLoadingComplete={onLoadingComplete}
                        width={width}
                        height={height}
                    />
                ):null
            }
        </>
    )
}

export { VisualizationPluginWrapper }