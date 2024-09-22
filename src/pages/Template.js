import { useDataQuery } from '@dhis2/app-runtime'
import React, { useEffect, memo } from 'react'
import i18n from './../locales';

import Main from "./../layouts/Main";
import { BulletinEditorApp } from '../editor';
import { generateUid, useStore } from '../utils';
import { useShallow } from 'zustand/react/shallow';
import { CircularLoader } from "@dhis2/ui"

const query = {
    me: {
        resource: 'me',
    },
}

const Template = memo(({ data, user }) =>{
    const { error, loading, engine } = useDataQuery(query);
    const setReportUid = useStore(useShallow((state)=>state.setReportUid));
    useEffect(()=>{
        setReportUid(generateUid());
    },[setReportUid]);
    
    if (error) {
        return(
            <Main title={i18n.t("Bulletins")}>
                <span>ERROR: {error.message}</span>
            </Main>
        )
    }
    if (loading) {
        return(
            <Main title={i18n.t("Bulletins")}>
              <CircularLoader/>
            </Main>
        )
    }

    return (
        <Main title={i18n.t("Automated Bulletin")}>
            <h5>{i18n.t('Design the Report Template')}</h5>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                paddingBottom: '16px',
                background: '#e0e7ed',
            }}>
                <BulletinEditorApp user={ user } engine={ engine } title = {data?.name} data={JSON.stringify(data?.editorState)} />
            </div>
        </Main>
    );
})

export default Template
