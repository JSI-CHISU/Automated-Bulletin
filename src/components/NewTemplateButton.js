import { useDataMutation } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'

const templateMutation = {
    resource: "dataStore/malaria-bulletin/templates",
    type: 'update',
    data: ({ data }) => data,
}

export const NewTemplateButton = ({ label, data, refetch }) => {

    const [mutate, { loading }] = useDataMutation(templateMutation, {
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