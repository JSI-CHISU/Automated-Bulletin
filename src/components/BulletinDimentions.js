import React, { useEffect } from 'react'
import { Center, CircularLoader } from '@dhis2/ui'
import OrganisationUnitsField from './OrganisationUnitsField'
import { PeriodField } from './PeriodField'
import { PeriodTypeField } from './PeriodTypeField'
import { getPeriod } from '../utils'
import classes from './../App.module.css'

const FULL_ROUTE = window.location.href
const APP_NAME = "malaria-bulletins"
const MY_LOCAL_PORT = "http://localhost:8085/api"
const API_BASE_ROUTE = FULL_ROUTE.substring(0, FULL_ROUTE.indexOf('/apps/'.concat(APP_NAME).concat('/')))
const ORGANISATION_UNITS_ROUTE = MY_LOCAL_PORT.concat('/organisationUnits.json?paging=false&fields=id,name,displayName,parent,level')
const ME_ROUTE = MY_LOCAL_PORT.concat('/me.json?fields=id,displayName,name,authorities,userGroups')
const ORGANISATION_UNIT_LEVELS_ROUTE = MY_LOCAL_PORT.concat('/organisationUnitLevels.json?paging=false&fields=id,name,level')

export const BulletinDimentions = ({
    orgUnits,
    setOrgUnits,
    setOrgUnitLevels,
    setMaxLevel,
    setMinLevel,
    setSelectedOrgUnits,
    loadingOrganisationUnits,
    setLoadingOrganisations,
    setCurrentOrgUnits,
    setExpandedKeys,
    expandedKeys,
    currentOrgUnits,
    setMeOrgUnitId,
    meOrgUnitId,
    setSelectedPeriod,
    selectedPeriod,
    setSelectedPeriodType,
    selectedPeriodType,
}) => {

    const loadOrgUnitLevels = async _ => {
        try {
            setLoadingOrganisations(true)
            const me_request = await fetch(ME_ROUTE.concat(',organisationUnits'), {
                credentials: "include"
            })
            const me_response = await me_request.json()

            if (me_response.status === "ERROR")
                throw new me_response

            const userOrganisationUnitId = me_response.organisationUnits.length !== 0 && me_response.organisationUnits[0].id
            if (userOrganisationUnitId) {
                const request = await fetch(ORGANISATION_UNIT_LEVELS_ROUTE, {
                    credentials: "include"
                })
                const response = await request.json()
                if (response.status === "ERROR")
                    throw response

                const levels = response.organisationUnitLevels.map(lvl => lvl.level)
                const orgLvl = response.organisationUnitLevels.sort((a, b) => a.level - b.level)

                let min = Math.min.apply(null, levels)
                let max = Math.max.apply(null, levels)

                setOrgUnitLevels(orgLvl)
                setMaxLevel(max)
                setMinLevel(min)

                setMeOrgUnitId(userOrganisationUnitId)

                orgLvl.length > 0 && await loadOrganisationUnits(orgLvl)
            }

        } catch (err) {
            setLoadingOrganisations(false)
            console.error(err)
        }
    }


    const loadOrganisationUnits = async (orgUnitLevels) => {
        try {
            const requestOU = await fetch(ORGANISATION_UNITS_ROUTE.concat('&fields=id,name,level,parent, path, displayName'), {
                credentials: "include"
            })
            const responseOU = await requestOU.json()
            if (responseOU.status === "ERROR")
                throw responseOU

            let newOuArray = []

            for (let level of orgUnitLevels) {
                newOuArray.push({
                    name: level.name,
                    level: level.level,
                    id: level.id,
                    value: null
                })
            }

            setOrgUnits(responseOU.organisationUnits)
            setSelectedOrgUnits(newOuArray)
            setLoadingOrganisations(false)

        } catch (err) {
            setLoadingOrganisations(false)
        }
    }

    const OrganisationUnitBloc = () => <div>
        <div>
            <div className='border p-3 mt-4 rounded' style={{ padding: '8px' }}>
                <OrganisationUnitsField
                    currentOrgUnits={currentOrgUnits}
                    setCurrentOrgUnits={setCurrentOrgUnits}
                    expandedKeys={expandedKeys}
                    orgUnits={orgUnits}
                    setExpandedKeys={setExpandedKeys}
                    loadingOrganisationUnits={loadingOrganisationUnits}
                    setLoadingOrganisations={setLoadingOrganisations}
                    meOrgUnitId={meOrgUnitId}
                />
            </div>
        </div>
    </div>

    const PeriodTypeBloc = () => <div>
        <div>
            <div className='border p-3 mt-4 rounded' style={{ padding: '8px' }}>
                <PeriodTypeField setState={setSelectedPeriodType} state={selectedPeriodType} setSelectedPeriod={setSelectedPeriod} />
            </div>
        </div>
    </div>

    const PeriodBloc = () => <div>
        <div>
            <div className='border p-3 mt-4 rounded' style={{ padding: '8px' }}>
                <PeriodField selectedPeriodType={selectedPeriodType} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
            </div>
        </div>
    </div>

    const RenderBulletinDimentions = () => (
        <>
            {
                orgUnits.length === 0 ?
                    (
                        <div className='mt-2' style={{ display: 'flex', alignItems: 'center' }}>
                            <CircularLoader small /> <span style={{ marginLeft: '5px' }}>Loading...</span>
                        </div>
                    ) : (
                        <>
                            <div className={classes.dimention__filters}>
                                <div className={classes.organisation__unit__bloc}>
                                    <div>
                                        {OrganisationUnitBloc()}
                                    </div>
                                </div>
                                <div className={classes.period__type__bloc}>
                                    {PeriodTypeBloc()}
                                </div>
                                <div className={classes.period__bloc}>
                                    {PeriodBloc()}
                                </div>
                            </div>
                            <br />
                            <div>
                                {
                                    currentOrgUnits.length > 0 &&
                                    (
                                        <div className={classes.selected__org__unit__period}>
                                            <div className={classes.selected__org__unit}>{currentOrgUnits[0].name}</div>
                                            {
                                                selectedPeriod !== null && selectedPeriod.length != 0 && (
                                                    <div className={classes.selected__period}>{getPeriod(selectedPeriod, selectedPeriodType)}</div>
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </>
                    )
            }
        </>
    )

    useEffect(() => {
        loadOrgUnitLevels()
    }, [])

    return (
        <>
            {RenderBulletinDimentions()}
        </>
    )
}