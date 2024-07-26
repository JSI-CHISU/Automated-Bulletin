import React, { useState, useEffect } from "react";
import { Menu, MenuItem } from "@dhis2/ui";
import {  NavLink } from "react-router-dom";
import classes from "./../App.module.css"
import { useDataQuery } from '@dhis2/app-runtime';

const query = {
  me: {
      resource: 'me',
  },
}
export const  Navigation = () => {
  const [admin,setAdmin] = useState(false);
  const { data } = useDataQuery(query);
  useEffect(()=>{
    setAdmin(data?.me?.authorities?.includes('BULLETIN_ADMIN') || data?.me?.authorities?.includes('ALL'));
   },[data?.me?.authorities]);

  return (
    <Menu className={classes.navigation}>
      
        <NavLink
          to="/report"
          className={({ isActive, isPending, isTransitioning }) =>
            [
              isPending ? "pending" : "",
              isActive ? "active" : "",
              isTransitioning ? "transitioning" : "",
            ].join(" ")
          }
        >
          <MenuItem label="Bulletins" />
        </NavLink>
        {
          admin?(
            <NavLink
              to="/template"
              className={({ isActive, isPending, isTransitioning }) =>
                [
                  isPending ? "pending" : "",
                  isActive ? "active" : "",
                  isTransitioning ? "transitioning" : "",
                ].join(" ")
              }
            >
            <MenuItem label="Design Template" />
            </NavLink>
          ): null
        }
        <NavLink
          to="/settings"
          className={({ isActive, isPending, isTransitioning }) =>
            [
              isPending ? "pending" : "",
              isActive ? "active" : "",
              isTransitioning ? "transitioning" : "",
            ].join(" ")
          }
        >
         <MenuItem label="Settings" />
        </NavLink>
    </Menu>
  );
};

export default Navigation;