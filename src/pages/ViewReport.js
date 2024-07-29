import React, { useEffect, useState } from "react"
import i18n from "@dhis2/d2-i18n"
import Main from "../layouts/Main"
import { CircularLoader, Table, TableBody, TableCell, TableCellHead, TableHead, TableRow } from "@dhis2/ui"
import { useDataQuery, useDataMutation, useConfig } from '@dhis2/app-runtime'
import { Link } from "react-router-dom"
import { generateUid } from "../utils";
import sortBy from 'lodash/sortBy';


const queryTemplates = {
  templates: {
    resource: `dataStore/automated_bulletin`,
    params:{
      fields: 'id,name,updatedAt,updatedBy,published,fileResource',
      paging: false,
      headless: true,
    }
  }
}
const queryReport = (id)=>({
  report: {
    resource: `dataStore/automated_bulletin/${id}`
  }
});

const delMutation={
  resource: 'dataStore/automated_bulletin',
  type: 'delete',
  id: ({id })=>id
}
const mutation = {
  resource: 'dataStore/automated_bulletin',
  type: 'update',
  id: ({id })=>id,
  data: ({ data, id, name, published = false })=>({ 
    ...data,
    id: id,
    name: name,
    updatedAt: new Date(),
    published: published
  })
}

export const ViewReport = ({ user }) => {
  const { loading, error, data, engine, refetch } = useDataQuery(queryTemplates);
  const [mutate, { loading:isLoading }] = useDataMutation(mutation);
  const [delMutate, { loading:isDeleteLoading }] = useDataMutation(delMutation);
  const [templates,setTemplates] = useState([]);
  const [admin,setAdmin] = useState(false);
  const [deleted,setDeleted] = useState(false);

  const { baseUrl } = useConfig();
  
  useEffect(()=>{
    console.log(data);
    if(data && !loading){
      setTemplates(sortBy(data?.templates,['updatedAt'])?.reverse());
    }
  },[data,loading,refetch]);

 useEffect(()=>{
  setAdmin(user?.authorities?.includes('BULLETIN_ADMIN') || user?.authorities?.includes('ALL'));
 },[user?.authorities]);

  const cloneReport = async(_e,{ id })=>{
    if(id){
      const template = await engine.query(queryReport(id));
      if(template){
        const cloneUid = generateUid();
        await mutate({
          id: cloneUid,
          data: template?.report,
          name: `${template?.report?.name || ''}-copy-${ cloneUid}`
        });
        refetch();
      }
    }
  }
  const deleteReport = async(_e,{ id })=>{
    await delMutate({id});
    refetch();
    setDeleted(true);
  }
  if(loading || isLoading || isDeleteLoading){
    return(
      <Main title={i18n.t("Bulletins")}>
        <CircularLoader/>
      </Main>
    )
  }
  if(error){
    return(
      <Main title={i18n.t("Bulletins")}>
         <span>ERROR: {error.message}</span>
      </Main>
     
    )
  }
  return (
    <Main title={i18n.t("Bulletins")}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCellHead>Bulletin Name</TableCellHead>
            <TableCellHead>Updated By</TableCellHead>
            <TableCellHead>Last Updated</TableCellHead>
            <TableCellHead>Action</TableCellHead>
          </TableRow>
        </TableHead>
        {
          <TableBody>
            {templates?.map((elem, key) => (
              <TableRow key={ `${elem?.id}-${key}`}> 

                <TableCell>{elem?.name}</TableCell>
                <TableCell>{elem?.updatedBy?.name}</TableCell>
                <TableCell>{new Date(elem?.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  {
                    elem?.published?(
                    <a
                      href={ `${baseUrl}/api/fileResources/${elem?.fileResource}/data`}
                      style={
                        {
                          paddingRight: '40px'
                        }
                      }
                    > 
                      {`Download`}
                    </a>
                    ):(
                      <span 
                        style={
                          {
                            paddingRight: '16px'
                          }
                        }
                      >
                        Not Published
                      </span>
                    )
                  }
                  {
                    admin?(
                      <>
                        <Link
                          to={ `/download?id=${elem?.id}&mode=edit`}
                          style={
                            {
                              paddingRight: '16px'
                            }
                          }
                        > 
                          { `Edit`}
                        </Link>
                        <Link
                          to={ `/report?id=${elem?.id}&mode=clone`}
                          onClick={ (e)=>cloneReport(e,{ id: elem?.id, name: elem?.name })}
                          style={
                            {
                              paddingRight: '16px'
                            }
                          }
                        > 
                          { `Clone`}
                        </Link>
                        <Link
                          to={ `/download?id=${elem?.id}&mode=publish`}
                          style={
                            {
                              paddingRight: '16px'
                            }
                          }
                        > 
                          { `Publish`}
                        </Link>
                        <Link
                          to={ `/report?id=${elem?.id}&mode=delete`}
                          onClick={ (e)=>deleteReport(e,{ id: elem?.id })}
                          style={
                            {
                              paddingRight: '16px'
                            }
                          }
                        > 
                          { `Delete`}
                        </Link>
                      </>
                    ): null
                  }
                </TableCell>                  
              </TableRow>
            ))}
          </TableBody>
        }
      </Table>
      {
        (isDeleteLoading && deleted)?(
          <AlertBar permanent success>
            {`Template deleted` }
          </AlertBar>
        ): null
      }
    </Main>
  )
}

export default ViewReport
