

import type {LexicalEditor} from 'lexical';

import {$createCodeNode, $isCodeNode} from '@lexical/code';
import {exportFile, importFile} from '@lexical/file';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';
import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  RootNode,
} from 'lexical';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';

import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import {PLAYGROUND_TRANSFORMERS} from '../MarkdownTransformers';
import {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION,
} from '../SpeechToTextPlugin';
import { postBlobFile, useStore } from '../../../utils';
import { useConfig, useDataEngine, useDataMutation } from '@dhis2/app-runtime'
import { useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { AlertBar } from '@dhis2-ui/alert';

const mutation: any = {
    resource: 'dataStore/automated_bulletin',
    type: 'update',
    id: ({id })=>id,
    data: ({ data, id, name, updatedBy, published=false,fileResource='', })=>({ 
      ...data,
      id: id,
      name: name,
      updatedAt: new Date(),
      published: published,
      fileResource: fileResource,
      updatedBy: updatedBy
    })
}


async function sendEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  try {
    await fetch('http://localhost:1235/setEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
}

export const getJsonEditorState = async(editor: LexicalEditor): Promise<any> =>{
  const jsonState = (editor.toJSON());
  return jsonState;
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response: any = null;
  try {
    response = await fetch('http://localhost:1235/validateEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error(
      'Editor state validation failed! Server did not accept changes.',
    );
  }
}

const queryReport = (id)=>({
  report: {
    resource: `dataStore/automated_bulletin/${id}`
  }
});

export default function ActionsPlugin({
  isRichText,
  createPdf,
  name,
  user
}: {
  isRichText: boolean;
  createPdf?():any;
  name?: string;
  user?: any;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();
  const {isCollabActive} = useCollaborationContext();
  const getEditorState = useStore((state)=>state.getEditorState);
  const [searchParams, _setSearchParams] = useSearchParams();
  const reportUid = useStore(useShallow((state)=>state.reportUid));
  const setPublished = useStore((state)=>state.setPublished);
  const [posted,setPosted] = useState(false);
  const [finished,setFinished] = useState(false);
  const [mode,setMode] = useState<any>('edit');
  const id = searchParams.get('id');
  const curMode = searchParams.get('mode');
  const { baseUrl } = useConfig();
  const engine = useDataEngine();
  const [mutate, { loading, error, called }] = useDataMutation(mutation);
  
  const publishReport = async({id,name,blob })=>{
    if(id){
      const fileResponse = await postBlobFile({
        url: baseUrl,
        blob: blob,
        fileName: `${name}.pdf`
      });
     return fileResponse?.response;
    }
    return false;
  }
  const updateReport = async(response: any)=>{
    if(response?.fileResource?.id){
      const exTemplate = await engine.query(queryReport(id));
      if(exTemplate?.report){
        await mutate({
          id: id,
          name: name,
          data: exTemplate?.report,
          published: true,
          fileResource: response?.fileResource?.id,
          updatedBy: {
            id: user?.id,
            name: user?.displayName,
            username: user?.username
          }
        });
        return true;
      }
    }
    return false;
  }
  const commitTemplate = async ()=>{
    const content = { 
      editorState: editor.getEditorState().toJSON() 
    };
    getEditorState(content);
    if(!id){
      await mutate({
        id: reportUid,
        data: content,
        name: name,
        updatedBy: {
          id: user?.id,
          name: user?.displayName,
          username: user?.username
        }
      });
    }
    else{
      await mutate({
        id: id,
        data: content,
        name: name,
        updatedBy: {
          id: user?.id,
          name: user?.displayName,
          username: user?.username
        }
      });
    }
    setPosted(true);
    
    if(mode === 'publish'){
      // @ts-ignore
      const doc = await createPdf();
      const fileResponse = await publishReport({ 
        id: id, 
        name: name,
        blob: doc
      });

      const completed = await updateReport(fileResponse);
      setFinished(completed);
    }
  }
  useEffect(()=>{
    setPublished(posted);
    setMode(curMode)
    if(!loading && called){
      return;
    }
  },[posted,loading,curMode,called])

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerCommand<boolean>(
        CONNECTED_COMMAND,
        (payload) => {
          const isConnected = payload;
          setConnected(isConnected);
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({dirtyElements, prevEditorState, tags}) => {
        // If we are in read only mode, send the editor state
        // to server and ask for validation if possible.
        if (
          !isEditable &&
          dirtyElements.size > 0 &&
          !tags.has('historic') &&
          !tags.has('collaboration')
        ) {
          validateEditorState(editor);
        }
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
          } 
          else {
            if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren();
              setIsEditorEmpty(paragraphChildren.length === 0);
            } else {
              setIsEditorEmpty(false);
            }
          }
        });
      },
    );
  }, [editor, isEditable]);

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS,
        );
      } else {
        const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
        root
          .clear()
          .append(
            $createCodeNode('markdown').append($createTextNode(markdown)),
          );
      }
      root.selectEnd();
    });
  }, [editor]);

  return (
    <div className="actions">
      {
          <Button
            className="action-button export"
            onClick={ commitTemplate }
            title={ mode !== 'publish'?'Save Changes':'Publish' }
            aria-label={ mode !== 'publish'?'Save Changes':'Publish' }>
            { mode !== 'publish'?'Save Changes':'Publish' }
          </Button>
       // )
      }
      {SUPPORT_SPEECH_RECOGNITION && (
        
        <button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          className={
            'action-button action-button-mic ' +
            (isSpeechToText ? 'active' : '')
          }
          title="Speech To Text"
          aria-label={`${
            isSpeechToText ? 'Enable' : 'Disable'
          } speech to text`}>
          <i className="mic" />
        </button>
      )}
      <button
        className="action-button import"
        onClick={() => importFile(editor)}
        title="Import"
        aria-label="Import editor state from JSON">
        <i className="import" />
      </button>
      <button
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `Export ${new Date().toISOString()}`,
            source: 'Playground',
          })
        }
        title="Export"
        aria-label="Export editor state to JSON">
        <i className="export" />
      </button>
      <button
        className="action-button clear"
        disabled={isEditorEmpty}
        onClick={() => {
          showModal('Clear editor', (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
          ));
        }}
        title="Clear"
        aria-label="Clear editor contents">
        <i className="clear" />
      </button>
      <button
        className={`action-button ${!isEditable ? 'unlock' : 'lock'}`}
        onClick={() => {
          // Send latest editor state to commenting validation server
          if (isEditable) {
            sendEditorState(editor);
          }
          editor.setEditable(!editor.isEditable());
        }}
        title="Read-Only Mode"
        aria-label={`${!isEditable ? 'Unlock' : 'Lock'} read-only mode`}>
        <i className={!isEditable ? 'unlock' : 'lock'} />
      </button>
      <button
        className="action-button"
        onClick={handleMarkdownToggle}
        title="Convert From Markdown"
        aria-label="Convert from markdown">
        <i className="markdown" />
      </button>
      {isCollabActive && (
        <button
          className="action-button connect"
          onClick={() => {
            editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
          }}
          title={`${
            connected ? 'Disconnect' : 'Connect'
          } Collaborative Editing`}
          aria-label={`${
            connected ? 'Disconnect from' : 'Connect to'
          } a collaborative editing server`}>
          <i className={connected ? 'disconnect' : 'connect'} />
        </button>
      )}
      {modal}
      {
        error?(
          <AlertBar permanent warning>
              Template not saved.
          </AlertBar>
        ): null
      }
      {
        (!loading && called && finished && mode ==='publish')?(
          <AlertBar permanent success>
              { `Template ${ mode ==='publish'?'published successfully':'saved'}` }
          </AlertBar>
        ): null
      }
      {
        (!loading && called && mode !=='publish')?(
          <AlertBar permanent success>
              { `Template saved` }
          </AlertBar>
        ): null
      }
    </div>
   
  );
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}>
          Clear
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus();
            onClose();
          }}>
          Cancel
        </Button>
      </div>
    </>
  );
}
