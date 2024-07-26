/**
 * DHIS2 Utils for UID generation
 */

const abc = 'abcdefghijklmnopqrstuvwxyz'
const letters = abc.concat(abc.toUpperCase())

const ALLOWED_CHARS = `0123456789${letters}`

const NUMBER_OF_CODEPOINTS = ALLOWED_CHARS.length
const CODESIZE = 11

const CODE_PATTERN = /^[a-zA-Z]{1}[a-zA-Z0-9]{10}$/
/**
* Generate a random text based on maximum characters
* @param {*} max 
* @returns 
*/
export const randomWithMax=(max)=> {
    return Math.floor(Math.random() * max)
}

/**
 * Generate a valid DHIS2 uid. A valid DHIS2 uid is a 11 character string which starts with a letter from the ISO basic Latin alphabet.
 *
 * @return {string} A 11 character uid that always starts with a letter.
 *
 *
 * generateUid();
 */
export const generateUid=()=> {
    // First char should be a letter
    let randomChars = letters.charAt(randomWithMax(letters.length))

    for (let i = 1; i < CODESIZE; i += 1) {
        randomChars += ALLOWED_CHARS.charAt(randomWithMax(NUMBER_OF_CODEPOINTS))
    }

    // return new String( randomChars );
    return randomChars
}

/**
 * Tests whether the given code is valid.
 *
 * @param {string} code The code to validate.
 * @return {boolean} Returns true if the code is valid, false otherwise.
 *
 *
 * isValidUid('JkWynlWMjJR'); // true
 * isValidUid('0kWynlWMjJR'); // false (Uid can not start with a number)
 * isValidUid('AkWy$lWMjJR'); // false (Uid can only contain alphanumeric characters.
 */
export const isValidUid=(code)=> {
    if (code == null) {
        return false
    }

    return CODE_PATTERN.test(code)
}


export const combineStyles = (main, override) => {
    let result = { ...main };
    let ov = { ...override };
    if (typeof override == "object") {
        Object.assign(result, ov);
    }
    return result;
}

export const calculateWidth = (total=0, totalElements) => {
    let width = (100 - total) / totalElements;
    return width + "%";
}

/**
 * Sum of an array of numbers
 * @param {array} array
 * @returns {number} sum of the array
 */
export const sumOfArray = (array) => {
    if (Array.isArray(array)) {
        return array.reduce((a, b) => a + b, 0);
    }
    return 0;
}

export const getColumns =(columns=[])=>{
    return columns?.map((column)=>{
        column.field =column.column;
        return column;
    })
}

export const getRowData = (data,columns)=>{
    const rows =[];
    data?.forEach((d)=>{
        const row = {};
        columns?.forEach((col,i)=>{
            return row[col.field] = d[i];
        })
        rows.push(row);
    })
    return rows;
}
export const getHeadingLevel = (tag)=>{
    if(tag === 'h1'){
      return 1;
    }
    else if(tag === 'h2'){
        return 2;
    }
    else if(tag === 'h3'){
        return 3;
    }
    else if(tag === 'h4'){
        return 4;
    }
    else if(tag === 'h5'){
        return 5;
    }
    else{
      return 6;
    }
}
export const convertStyle = (style)=>{
    const arrayStyle = style?.split(";")?.filter(Boolean);
    return Object.keys(arrayStyle).reduce((acc, key) => {
        const camelCaseKey = key.replace(/-([a-z])/g, (_, match) => match.toUpperCase());
        acc[camelCaseKey] = arrayStyle[key];
        return acc;
    }, {});
}
export const getFormat =(format)=>{
    if(format === 1){
        return ({
            fontWeight: 'bold'
        });
    }
    else if(format === 2){
        return ({
            fontStyle: 'italic'
        });
    }
    else if(format === 3){
        return ({
            fontWeight: 'bold',
            fontStyle: 'italic'
        });
    }
    else if(format === 4){
        return ({
            textDecoration: 'underline'
        });
    }
    else if(format === 8){
        return ({
            textDecoration: 'underline'
        });
    }
    else if(format === 16){
        // code
        return {};
    }
    else if(format === 32){
        return ({
            verticalAlign: 'sub',
            fontSize: '.83em'
        });
    }
    else if(format === 64){
        return ({
            verticalAlign: 'super',
            fontSize: '.83em'
        });
    }
    else{
        return {};
    }

}
export const getContent =(node)=>{
    return node?.children?.map((child)=>{
        if(child?.type === 'paragraph'){
            return ({
                type: child?.type,
                content: child?.children?.map((cp)=>{
                    if (cp?.type === 'dhis2plugin'){
                        return({
                            type: 'dhis2plugin',
                            dhis2id: cp?.dhis2id,
                            dhis2type: cp?.dhis2type,
                            content: cp?.text,
                            style: cp?.style,
                            src: cp?.src,
                            //src: publishedCache?.[cp?.dhis2id],
                            embed:{
                                id: cp?.dhis2id,
                                style: cp?.style
                            }
                        }) 
                    }
                    const style = {
                        ...(convertStyle(cp?.style)),
                        ...(getFormat(cp?.format))
                    };
                    return ({
                        type: cp?.type || child?.type,
                        content: cp?.text, 
                        style: style
                    })
                })
            })
        }
        else if(child?.type === 'heading'){
            return ({
                type: child?.type,
                level: getHeadingLevel(child?.tag),
                content: child?.children?.map((cp)=>{
                    return ({
                        type: cp?.type || child?.type,
                        content: cp?.text, 
                        style: cp?.style,
                    })
                })
            }) 
        }
        else if(child?.type === 'layout-container'){
            return ({
                type: child?.type,
                style: child?.style,
                content: child?.children?.map((cp)=>{
                    return ({
                        type: cp?.type || child?.type,
                        content: getContent(cp), 
                        style: cp?.style,
                    })
                })
            }) 
        }
        else if (child?.type === 'dhis2plugin'){
            return({
                type: 'dhis2plugin',
                dhis2id: child?.dhis2id,
                dhis2type: child?.dhis2type,
                content: child?.text,
                style: child?.style,
                embed:{
                    id: child?.dhis2id,
                    style: child?.style
                }
            }) 
        }
        else if( child?.type === 'dhis2'){
            const dhis2id = child?.dhis2ID?.split(" ");
            if(dhis2id[1] === 'CHART'){
                return({
                    type: 'chart',
                    content: child?.text,
                    style: child?.style,
                    embed:{
                        id: dhis2id[0],
                        style: child?.style
                    }
                })
            }
            else if(dhis2id[1] === 'MAP'){
                return({
                    type: 'map',
                    content: child?.text,
                    style: child?.style,
                    embed:{
                        id: dhis2id[0],
                        style: child?.style
                    }
                })
            }
            else if(dhis2id[1] === 'PIVOT_TABLE'){
                return({
                    type: 'table',
                    content: child?.text,
                    style: child?.style,
                    embed:{
                        id: dhis2id[0],
                        style: child?.style
                    }
                })
            }
            else{

            }
        }
        return {};
    });
}
export const tranformLexicalStateToPdfLayout = ( state)=>{
    const root = state?.editorState?.root;
    console.log('root:',state);
    return ({
        content: getContent(root)
    });
    
}
export const getNumberOfLinkedBulletin = (templateId, bulletins) => {
    let count = 0;
    Object.keys(bulletins).map((id) => {
        if (templateId == bulletins[id].templateId)
            count++
    })

    return count;
}

export const imageUrlToBase64 = async (url) => {
    const data = await fetch(url,{
      credentials: "include"
    });
    const blob = await data.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = reject;
    });
  };
  
  export const imageUrlToBlob = async(id,engine) =>{
    /*const data = await fetch(url,{
      credentials: "include"
    });
    const blob = await data.blob();
    return URL.createObjectURL(blob);
    */
    const qx = {
      visualizations: {
        resource: 'visualizations',
        id: `${id}/data.png` 
      }
    };
    const data = await engine.query(qx);
    const blob = await data.visualizations;
    return blob;
  }

  export const getTableColumns = (data)=>{
    const headers = data?.headers?.map((h)=>{
        h.field = h.column;
        return h;
    })?.filter((f)=>!f?.hidden);
    const tableData = data?.rows?.map((d)=>{
        const row = {};
        data?.headers?.forEach((value,index)=>{
            row[value.column] = d?.[index]; 
        });
        return row;
    })?.filter(Boolean)?.filter(String);
    return ({
        columns: headers,
        data: tableData,
        title: data?.title
    });
  }


export const updateTemplatesList = (oldTemplates, id) => {
    let newTemplates = {}
    Object.keys(oldTemplates).map((temId) => {
        if (id !== temId) {
            newTemplates[temId] = {
                "id": temId,
                "name": oldTemplates[temId]?.name || "",
                "title": oldTemplates[temId]?.title || "",
                "createdAt": oldTemplates[temId]?.createdAt || "",
                "updatedBy": oldTemplates[temId]?.updatedBy || "",
                "updatedAt": oldTemplates[temId]?.updatedAt || "",
                "layout": oldTemplates[temId]?.layout || [],
                "dimensions": oldTemplates[temId]?.dimensions || {},
            }
        }
    })

    return newTemplates
} 

export const updateBulletinsList = (oldBulletins, id) => {
    let newBulletins = {}
    Object.keys(oldBulletins).map((bulId) => {
        if (id !== bulId) {
            newBulletins[bulId] = {
                "id": bulId,
                "name": oldBulletins[bulId]?.name || "",
                "orgUnit": oldBulletins[bulId]?.orgUnit || "",
                "createdAt": oldBulletins[bulId]?.createdAt || "",
                "updatedBy": oldBulletins[bulId]?.updatedBy || "",
                "updatedAt": oldBulletins[bulId]?.updatedAt || "",
                "htlm": oldBulletins[bulId]?.htlm || "",
                "period": oldBulletins[bulId]?.period || "",
                "templateId": oldBulletins[bulId]?.templateId || "",
            }
        }
    })

    return newBulletins
} 

export const addNewPayload = (payloads, payload, id) => {
    payloads[id] = payload

    return payloads
}

export const getPeriod = (selectedPeriod, selectedPeriodType) => {
    let period
    if (selectedPeriod !== null && selectedPeriod.lenght !== 0) {
        switch (selectedPeriodType) {
            case 'year':
                period = selectedPeriod.$y
                break

            case 'month':
                period = selectedPeriod.$y + '-' + getMonth(++selectedPeriod.$M)
                break

            case 'quarter':
                period = selectedPeriod.$y + '-' + getQuarter(++selectedPeriod.$M)
                break
        }
    }

    return period
}

const getMonth = (month) => {
    if (month < 10)
        return "0" + month

    return month
}

const getQuarter = (month) => {
    if (month < 4)
        return "Q1"

    if (month < 7)
        return "Q2"

    if (month < 10)
        return "Q3"

    else
        return "Q4"
}
  


  export const postFile = async({ file, fileName } )=>{
    const url = `../../fileResources`;
    const blob = new Blob([new Uint8Array(file)], {type:"application/octet-stream"});
    const formData = new FormData();
    formData.append('file',blob,fileName??`${fileName}`);
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        "accept": "application/json"
      }
    });
    let res = await response.json();
    return res;
}
export const postBlobFile = async({ url,blob, fileName } )=>{
    const fileApi = `${url}/api/fileResources`;
    const file = new Blob([blob],{type:"application/octet-stream"});
    const formData = new FormData();
    formData.append('file',file,fileName??`${fileName}`);
    formData.append('domain','DOCUMENT');
    const response = await fetch(fileApi, {
        credentials: "include",
        method: "POST",
        body: formData,
        headers: {
            "accept": "application/json"
        }
    });
    let res = await response.json();
    return res;
}
export const updateFileSharing = async({url,id, payload} )=>{
    const fileApi = `${url}/api/sharing?type=document&id=${id}`;
    const response = await fetch(fileApi, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "accept": "application/json",
            "content-Type": "application/json"
        }
    });
    let res = await response.json();
    return res;
}
export const deleteFile = async(file)=>{
    const url = `../../fileResources/${file}`;
    const response = await fetch(url, {
      method: "POST",
      body: new FormData(),
      headers: {
        "accept": "application/json"
      }
    });
    let res = await response.json();
    return res;
}

/**
 * Convert Unit8ClampedArray to Unit8Array for Image processing
 * @param {*} clampedArray 
 * @returns 
 */
export const convertClampedArrayToUint8Array = (clampedArray) => {
    const uint8Array = new Uint8Array(clampedArray.length);
    for (let i = 0; i < clampedArray.length; i++) {
      uint8Array[i] = Math.max(0, Math.min(255, clampedArray[i]));
    }
    return new Uint8Array(uint8Array);
};