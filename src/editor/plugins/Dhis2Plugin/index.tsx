import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from 'lexical';
import { useEffect, useRef, useState} from 'react';
import * as React from 'react';

import {
  $createDhis2Node,
  Dhis2Node,
} from '../../nodes/Dhis2Node';
import Button from '../../ui/Button';
import {DialogActions } from '../../ui/Dialog';
import TextInput from '../../ui/TextInput';
import Select from '../../ui/Select';

export const INSERT_DHIS2_VISUALIZATION_COMMAND: LexicalCommand<string> =
  createCommand('INSERT_DHIS2_VISUALIZATION_COMMAND');


export const InsertDhis2UriDialogBody =({
  onClick,
  engine
}: {
  onClick: (payload: string) => void;
  engine: any
}) => {
  const [visualizations,setVisualizations] = useState([]);
  const [visualizationType, setVisualizationType ] = useState('');
  const [selectedVisualization, setSelectedVisualization ] = useState('');
  const [item,setItem] = useState<any>(null);

  const isDisabled = selectedVisualization === '';

  const getVisualizationType = (event: React.ChangeEvent<HTMLSelectElement>, )=>{
    setVisualizationType(event.target.value);
  };

  const getSelectedVisualization = (event: React.ChangeEvent<HTMLSelectElement>, )=>{
    const value = `${event.target.value } ${ visualizationType }`
    setSelectedVisualization(value);
    setItem({ 
      id:event.target.value,
      type: visualizationType
    } );
  };
  const handleClick =()=>{
    onClick(selectedVisualization);
  }
  useEffect(()=>{
    const getVisualizations = async()=>{
      if(visualizationType){
        let q: any = {
          visualizations: {
            resource: 'visualizations',
            params: {
              fields: "id,name,type",
              paging: true,
              filter: (visualizationType === 'PIVOT_TABLE')?`type:eq:${ visualizationType }`:`type:ne:PIVOT_TABLE`
            }
          }
        };
        if(visualizationType === 'MAP'){
          q = {
            visualizations: {
              resource: 'maps',
              params: {
                fields: "id,name,type",
                paging: true
              }
            }
          };
          const maps  = await engine.query(q);
          setVisualizations(maps?.visualizations?.maps || []);
        }
        else{
          const data  = await engine.query(q);
          setVisualizations(data?.visualizations?.visualizations || []);
        }
      }
      else{
        setVisualizations([]);
      }
    }
    getVisualizations();
  },[engine.query,visualizationType]);
  return (
    <>
      <Select
        style={{marginBottom: '1em', width: '290px'}}
        label="Visualization Type"
        name="position"
        id="position-select"
        onChange={ getVisualizationType}>
          <option label="None" value="" />
          <option label="Maps" value="MAP" />
          <option label="Pivot Table" value="PIVOT_TABLE" />
          <option label="Charts" value="CHART" />
      </Select>
      <Select
        style={{marginBottom: '1em', width: '290px'}}
        label="Visualization"
        name="position"
        id="position-select"
        onChange={ getSelectedVisualization}
      >
        <>
          <option label="None" value="" />
          {
            visualizations?.map((viz: any, i:number)=>(
              <option key={`selected-option-${viz?.id}-${i}`} label={ viz?.name } value={ viz?.id} />
            ))
          }
        </>
      </Select>
      {/*selectedVisualization?(
        <Item 
          item={item}
          activeType = { visualizationType}
          setVisualization ={ (i:any)=>i }
          setActiveType ={ (t: string, i: any)=>null } 
        />
      ):null*/}
      {/*selectedVisualization?(
         <VisualizationPluginWrapper
            cid={item?.id}
        />
      ):null*/}
      <TextInput
        label="DHIS2 Visualization UID"
        placeholder="i.e. uid MAP"
        onChange={setSelectedVisualization}
        value={selectedVisualization}
        data-test-id="image-modal-url-input"
        //@ts-ignore
        readOnly = { true }
      />

      <DialogActions>
        <Button
          data-test-id="image-modal-confirm-btn"
          disabled={isDisabled}
          onClick={ handleClick}>
          Add
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertDhis2ImageDialog({
  activeEditor,
  onClose,
  engine
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  engine?: any
}): JSX.Element {
  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [activeEditor]);

  const onClick = (payload: string) => {
    activeEditor.dispatchCommand(INSERT_DHIS2_VISUALIZATION_COMMAND, payload);
    onClose();
  };

  return (
      <InsertDhis2UriDialogBody onClick={onClick} engine={ engine } />
  );
}

export default function Dhis2Plugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([Dhis2Node])) {
      throw new Error('Dhis2Plugin: Dhis2Node not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_DHIS2_VISUALIZATION_COMMAND,
      (payload) => {
        const dhis2Node = $createDhis2Node(payload);
        $insertNodeToNearestRoot(dhis2Node);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
