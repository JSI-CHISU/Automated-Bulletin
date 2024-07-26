
// @ts-nocheck
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import {memo, useEffect, useState} from 'react';
import {CAN_USE_DOM} from './shared/canUseDOM';

import {createWebsocketProvider} from './collaboration';
import {useSettings} from './context/SettingsContext';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import Dhis2Plugin from './plugins/Dhis2Plugin';
import Dhis2PluginImagePlugin from './plugins/Dhis2Plugin/Dhis2PluginImage';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import {LayoutPlugin} from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {  toPng } from 'dom-to-image-more';
import { PDFDocument } from 'pdf-lib';


const skipCollaborationInit =
  // @ts-expect-error
  window.parent != null && window.parent.frames.right === window;

export const  measureContentHeight=(content) => {
  return content.getBoundingClientRect();
}

export const computeImageDims =(image,pageSize,boundingRect)=>{
  if(pageSize.width > boundingRect.width){
    return boundingRect;
  }
  else{
    const dim = image.scaleToFit(pageSize.width-50,pageSize.height);
    return ({
      ...boundingRect,
      width: dim.width,
      height: dim.height
    })
  }
}
export const Editor = memo(({user, engine, data, name }) =>{
  const {historyState} = useSharedHistoryContext();
  const [pageSize,setPageSize] = useState({ height: 779, width: 525 });
  const [editor] = useLexicalComposerContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();


    
  const isEditable = useLexicalEditable();
  const text = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...';
  
  const placeholder = <Placeholder>{text}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  const mainEditor = document.getElementById('main-editor');
  if(mainEditor){
    mainEditor.style.width = `${(pageSize?.width * 1.3) + 42}px`; 
    mainEditor.style.padding = '16px';
    mainEditor.style.margin = '0% 16% 3% 16%';
    mainEditor.style.border = '1px dashed grey'
    const innerEditor = document.getElementById('bulletin-editor');
    if(innerEditor){
      innerEditor.style.width =  `${(pageSize?.width * 1.3) + 42}px`; 
    }
  }
  const createSmallPdf = async()=>{
    const doc = await PDFDocument.create();
    let page = doc.addPage();
    const pageSize = page.getSize();
    const { height } = pageSize;
    const contentHeightLimit = height - 50; // Adjust for margins
    let currentHeight = 0;

    const data = document.getElementById('bulletin-editor');
    const elems = Array.from(data.children);

    for (const content of elems) {
      const boundingRect = measureContentHeight(content);
      const imageData = await toPng(content);
      const imageBytes = await doc.embedPng(imageData);
      const imgSize = computeImageDims(imageBytes,pageSize,boundingRect);
      const nodeAttr = content?.getAttributeNode('type');
      if(((currentHeight + imgSize?.height + 30) > contentHeightLimit) || (nodeAttr?.value === 'page-break')){
        page = doc.addPage();  
        currentHeight = 0;
      }
      currentHeight += imgSize?.height; 
      page.drawImage(imageBytes,{
        x: imgSize?.x??0 + 30,
        y: page.getHeight() - currentHeight -50,
        width: imgSize?.width,
        height: imgSize?.height,
      });
         
    }
    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url,'_blank');
    return blob;
  }
  
  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);
  
  useEffect(()=>{
    let isMounted = true;
    if(isMounted){
      if(data){
        const editorState = editor.parseEditorState(data);
        editor.setEditorState(editorState);
      }
    }
    return ()=>{
      isMounted = false;
    }
  }, [data, editor])

  useEffect(()=>{
    const getPageSize=async()=>{
      const doc = await PDFDocument.create();
      let page = doc.addPage();
      const pageSize = page.getSize();
      setPageSize(()=>pageSize);
    }
    getPageSize();
  },[]);

  return (
    <>
      {isRichText && <ToolbarPlugin  engine={ engine } setIsLinkEditMode={setIsLinkEditMode} />}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
          !isRichText ? 'plain-text' : ''
        }`}>
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />
        <MentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        <CommentPlugin
          providerFactory={isCollab ? createWebsocketProvider : undefined}
        />
        {isRichText ? (
          <>
            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div id="main-editor" className="editor"  ref={onRef}>
                    <ContentEditable/>
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            <TableCellResizer />
            <Dhis2Plugin />
            <Dhis2PluginImagePlugin/>
            <ImagesPlugin />
            <InlineImagePlugin />
            <LinkPlugin />
            {/*
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            */}
            {!isEditable && <LexicalClickableLinkPlugin />}
            <HorizontalRulePlugin />
            {
              //<EquationsPlugin />
            
              //<ExcalidrawPlugin />
            }
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                {
                //<CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                }
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable />}
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}     
      </div>
      <div style={{
        padding: '32px 32px 48px 32px',
      }}>
        <ActionsPlugin isRichText={isRichText} createPdf={ createSmallPdf } name={ name } user={user}/>
      </div>
    </>
  );
})

export default Editor;
