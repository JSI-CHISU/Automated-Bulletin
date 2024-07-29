import React, { useEffect, useState } from 'react';
import { useDataQuery } from '@dhis2/app-runtime'
import { useNavigate, useSearchParams } from "react-router-dom"
import Template from './Template';

const queryTemplates = ({ id })=>({
  templates: {
    resource: `dataStore/automated_bulletin/${id}`
  }
});


export const DownloadReport =({ user })=>{
    const [searchParams, _setSearchParams] = useSearchParams();
    const id = searchParams.get('id');
    const mode = searchParams.get('mode');
    const { data } = useDataQuery(queryTemplates({id: id }));
    const navigate = useNavigate();
        
    const [template, setTemplate] = useState(null);

    useEffect(()=>{
        setTemplate(data?.templates);
    },[data?.templates])

    if(id && (mode ==='edit' || mode ==='publish')){
        return (
            <Template user={user} id={id} data ={ template }/>
        )
    }
    return navigate('/report');
}