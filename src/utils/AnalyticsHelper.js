import Handlebars from "handlebars";
//import { css } from '@emotion/react';

const getStyle =(elem)=>({
  //  [elem.style]: css( elem.style || {})
});

export const generateReportTemplate =(data) =>{
  let reportTemplate = "";
  if(data){
      data?.report?.forEach((elem)=>{
          if(elem.type === 'chart'){
            reportTemplate = reportTemplate + getAnalyticChartHelper(elem);
          }
      })
  }
  return reportTemplate;
}

export const getAnalyticChartHelper = (elem) =>{
    const elemStyle = getStyle(elem);
    const cssElem = elem?.style?elemStyle?.[elem?.style]:{};
  return new Handlebars.SafeString(
      `{{#Dhis2Chart  report}}
            <div class="entry" className={ cssElem }>
                <h1> {{{title}}} </h1>
                <div class="body">
                    {{{id}}}
                </div>
                <div>
                    {{{description}}}
                </div>
            </div>
       {{/Dhis2Chart}}`
  )
}

export const generateLink = (text, url) =>{
  const escapedUrl = Handlebars.escapeExpression(url);
  const escapedText = Handlebars.escapeExpression(text);
  return new Handlebars.SafeString("<a href='" + escapedUrl + "'>" + escapedText +"</a>");
}
