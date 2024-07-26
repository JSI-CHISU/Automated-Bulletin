import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$wrapNodeInElement, mergeRegister} from '@lexical/utils';
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from 'lexical';
import {ReactNode, useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {CAN_USE_DOM} from '../../shared/canUseDOM';

import {
  $createDhis2PluginNode,
  $isDhis2PluginNode,
  Dhis2PluginNode,
  Dhis2PluginPayload,
} from '../../nodes/Dhis2PluginNode';
import Button from '../../ui/Button';
import {DialogActions} from '../../ui/Dialog';
import TextInput from '../../ui/TextInput';
import Select from '../../ui/Select';

export type InsertDhis2PluginPayload = Readonly<Dhis2PluginPayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_DHIS2_PLUGIN_COMMAND: LexicalCommand<string> =
  createCommand('INSERT_DHIS2_PLUGIN_COMMAND');

  export const InsertDhis2PluginUriDialogBody =({
    onClick,
    engine
  }: {
    onClick: (payload: InsertDhis2PluginPayload) => void;
    engine: any
  }) => {
    const [visualizations,setVisualizations] = useState([]);
    const [visualizationType, setVisualizationType ] = useState('');
    const [selectedVisualization, setSelectedVisualization ] = useState('');
    const [item,setItem] = useState<any>(null);
  
    const isDisabled = selectedVisualization === undefined;
  
    const getVisualizationType = (event: React.ChangeEvent<HTMLSelectElement>, )=>{
      setVisualizationType(event.target.value);
    };
  
    const getSelectedVisualization = (event: React.ChangeEvent<HTMLSelectElement>, )=>{
      setSelectedVisualization(event.target.value);
      setItem({ 
        id:event.target.value,
        type: visualizationType
      } );
    };
    const handleClick =()=>{
      onClick({
        dhis2Id: selectedVisualization,
        dhis2type: visualizationType
      });
    }
    useEffect(()=>{
      const getVisualizations = async()=>{
        if(visualizationType){
          let q: any = {
            visualizations: {
              resource: 'visualizations',
              params: {
                fields: "id,name,type",
                paging: false,
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
                  paging: false
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
        <TextInput
          label="DHIS2 Visualization UID"
          placeholder="i.e. uid MAP"
          onChange={setSelectedVisualization}
          value={selectedVisualization}
          data-test-id="image-modal-url-input"
          readonly = { true }
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
  
  export function InsertDhis2PluginDialog({
    activeEditor,
    onClose,
    engine
  }: {
    activeEditor: LexicalEditor;
    onClose: () => void;
    engine?: any
  }): ReactNode {
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
  
    const onClick = (payload: InsertDhis2PluginPayload) => {
      // @ts-ignore
      activeEditor.dispatchCommand(INSERT_DHIS2_PLUGIN_COMMAND, payload);
      onClose();
    };
  
    return (
        <InsertDhis2PluginUriDialogBody onClick={onClick} engine={ engine } />
    );
  }

export default function Dhis2PluginImagePlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean;
  isPublished?:boolean;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([Dhis2PluginNode])) {
      throw new Error('Dhis2PluginImagePlugin: Dhis2PluginNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertDhis2PluginPayload>(
        INSERT_DHIS2_PLUGIN_COMMAND,
        (payload) => {
          const imageNode = $createDhis2PluginNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [captionsEnabled, editor]);

  return null;
}

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const img: any = document.createElement('div');
img.src = TRANSPARENT_IMAGE;

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData('text/plain', '_');
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
        dhis2Id: node.__dhis2Id,
        dhis2type: node.__dhis2type
      },
      type: 'dhis2plugin',
    }),
  );

  return true;
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_DHIS2_PLUGIN_COMMAND, data as any);
  }
  return true;
}

function getImageNodeInSelection(): Dhis2PluginNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isDhis2PluginNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertDhis2PluginPayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  const {type, data} = JSON.parse(dragData);
  if (type !== 'dhis2plugin') {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable__root')
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? (target as Document).defaultView
      : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}
