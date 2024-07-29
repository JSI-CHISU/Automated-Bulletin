import { Field, Input } from "@dhis2/ui"
import classes from "./../App.module.css"

export const TemplateAttributes = () => {

    return (
        <div>
            <Field className={classes.template__attributes} label="Template name">
                <Input name="name" placeholder="Automated Bulletin Name"/>
            </Field>
        </div>
    )
}