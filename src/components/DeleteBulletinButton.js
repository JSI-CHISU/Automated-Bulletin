import { useDataMutation } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'

const bulletinMutation = {
    resource: "dataStore/automated-bulletin/bulletins",
    type: 'update',
    data: ({ data }) => data,
}

export const DeleteBulletinButton = ({ label, newBulletins, refetch }) => {

    const [mutate, { loading: mutationLoading }] = useDataMutation(bulletinMutation, {
        variables: {
            data: newBulletins,
        },
    })

    const onClick = async () => {
        await mutate()
        refetch()
    }

    return (
        <Button destructive onClick={onClick}>{label}</Button>
    )
}