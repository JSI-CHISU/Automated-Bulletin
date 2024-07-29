import { useDataMutation } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'

const templateMutation = {
    resource: "dataStore/automated-bulletin/templates",
    type: 'update',
    data: ({ data }) => data,
}

export const DeleteTemplateButton = ({ label, newTemplates, refetch }) => {

    const [mutate, { loading: mutationLoading }] = useDataMutation(templateMutation, {
        variables: {
            data: newTemplates,
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