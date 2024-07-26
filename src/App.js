import React from "react"
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Template from "./pages/Template"
import Settings from "./pages/Settings"
import { ViewReport } from "./pages/ViewReport"
import { DownloadReport } from "./pages/DownloadReport";
import AppWrapper from "./utils/dhis2/AppWrapper";
import { useDataQuery } from '@dhis2/app-runtime';

const query = {
  me: {
      resource: 'me',
  },
}

const App = () => {
  const { data } = useDataQuery(query);
  return (
      <AppWrapper>
        <Router>
          <Routes>
            <Route path="/" index  element={<ViewReport user={ data?.me}/>} />
            <Route path="template"  element={<Template user={ data?.me}/>} />
            <Route path="settings" element={<Settings user={ data?.me}/>} />
            <Route path="report"  element={<ViewReport user={ data?.me}/>} />
            <Route path="download"  element={<DownloadReport user={ data?.me}/>} />
          </Routes>
        </Router>
      </AppWrapper>
  )
}

export default App;
