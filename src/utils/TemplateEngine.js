import Handlebars from "handlebars";
import { 
    generateLink, 
    generateReportTemplate
} from "./AnalyticsHelper";


/**
 * Register Handlebars Helpers
 */

Handlebars.registerHelper('Link', generateLink);
Handlebars.registerHelper("Dhis2Chart", (context, options)=> {
    return context?.map((item) => options?.fn(item))?.join("\n");
});

Handlebars.registerHelper("dhis2", (text, url, type) => {
    url = Handlebars.escapeExpression(url);
    text = Handlebars.escapeExpression(text);
    type = Handlebars.escapeExpression(type);
        
   return new Handlebars.SafeString("<img src='" + url + "/data"+  text +"."+ type +"'/>");
});

/**
 * Replace the data source with the template references
 * @param {*} data 
 * @param {*} template 
 * @returns 
 */
export const getCompiledTemplate = (template,data)=>{
    const baseTmpl = generateReportTemplate(template);
    const compiledTemplate = Handlebars.compile(`${baseTmpl}`);
    return compiledTemplate(data)
}
