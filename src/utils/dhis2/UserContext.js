import { createContext, useContext } from 'react';

const makeContext = (config) => config || {};

export const AppUserContext = createContext({});

export const useAppUser = ()=>useContext(AppUserContext);


export const AppUserProvider = ({
    config,
    children ,
}) => (
    <AppUserContext.Provider value={ config}>
        {children}
    </AppUserContext.Provider>
)