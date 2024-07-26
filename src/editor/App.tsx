import * as React from 'react';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {SettingsContext, useSettings} from './context/SettingsContext';
import {SharedAutocompleteContext} from './context/SharedAutocompleteContext';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import Editor from './Editor';
import BulletinNodes from './nodes/BulletinNodes';
import {TableContext} from './plugins/TablePlugin';
import TypingPerfPlugin from './plugins/TypingPerfPlugin';
import Settings from './Settings';
import BulletinEditorTheme from './themes/BulletinEditorTheme';
import './index.css';
import { InputField } from '@dhis2-ui/input';
import { useEffect, useState } from 'react';


export const AppEditor =({ title, engine, data, name, user }:any ): JSX.Element=> {
  const {
    settings: {isCollab, emptyEditor, measureTypingPerf},
  } = useSettings();
  const [templateName, setTemplateName] = useState('');
  const initialConfig = {
    editorState: isCollab? null: (data??emptyEditor),
    namespace: 'BulletinEditor',
    nodes: [...BulletinNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: BulletinEditorTheme,
  };
  const onSetTemplateName = ({ value },_event)=>{
    setTemplateName(value);
  }
  useEffect(()=>{
    setTemplateName( name )
  },[name]);
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <header>
              { title }
            </header>
            <div className="editor-shell">
              
              <InputField
                className ='templateTitle'
                type="text"
                label = { "Name of the Template"}
                placeholder= {'Name of the template'}
                value = { templateName }
                name ="name"
                onChange={ onSetTemplateName }
              />
              <Editor user={user } engine ={ engine } data={data} name={ templateName} />
            </div>
            <Settings />
            {measureTypingPerf ? <TypingPerfPlugin /> : null}
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}

export const BulletinEditorApp =({ engine, data, title, user }:  any): JSX.Element=> {

  return (
    <SettingsContext>
      <AppEditor user={user } engine={ engine } data={data} name={title} />
    </SettingsContext>
  );
}

