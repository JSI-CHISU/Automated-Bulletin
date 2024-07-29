import { useDataMutation } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'

const bulletinMutation = {
    resource: "dataStore/automated-bulletin/bulletins",
    type: 'update',
    data: ({ data }) => data,
}

export const NewBulletinButton = ({ label, data, refetch }) => {
   
    const [mutate, { loading }] = useDataMutation(bulletinMutation, {
        variables: {
            data: data,
        }
    })

    const onClick = async () => {
        await mutate()
        refetch()
    }

    return (
        <Button primary disabled={loading} onClick={onClick}>{label}</Button>
    )
      
}