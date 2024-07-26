import { useConfig } from '@dhis2/app-runtime';

export const BASE_URL = useConfig()
export const DATA_STORE_ROUTE = BASE_URL.concat('/dataStore')