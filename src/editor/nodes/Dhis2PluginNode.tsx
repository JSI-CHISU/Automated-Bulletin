
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import {$applyNodeReplacement, $getNodeByKey, createEditor, DecoratorNode} from 'lexical';
import * as React from 'react';
import {ReactNode, Suspense} from 'react';
import { toPng, toSvg } from 'dom-to-image-more';
import {  } from '@lexical/utils';

const Dhis2PluginComponent = React.lazy(() => import('./Dhis2PluginComponent'));

export interface Dhis2PluginPayload {
  altText?: string;
  caption?: LexicalEditor;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src?: string;
  width?: number;
  captionsEnabled?: boolean;
  dhis2Id: string;
  dhis2type: string;
}

function convertDhis2PluginElement(domNode: HTMLElement): null | DOMConversionOutput {
  const img = domNode as (HTMLElement | any);
  const dhis2ID = domNode.getAttribute('data-lexical-dhis2plugin');
  const {alt: altText, src, width, height, dhis2Id, dhis2type } = img;
  if(dhis2ID){
    const node = $createDhis2PluginNode({altText, height, src, width, dhis2Id, dhis2type});
    return {node};
  }
  return null;
}

export type SerializedDhis2PluginNode = Spread<
  {
    altText?: string;
    caption: SerializedEditor;
    height?: number;
    maxWidth?: number;
    showCaption?: boolean;
    src?: string;
    width?: number;
    dhis2Id: string;
    dhis2type: string;
  },
  SerializedLexicalNode
>;

export class ImageUtils {
  getNodeImage (node: any) {
    return toPng(node).then((dataUrl)=>{
      return dataUrl;
    });
  }
  getResolvedObject (d: any){
    return d;
  }
}
export class Dhis2PluginNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;
  __showCaption: boolean;
  __caption: LexicalEditor;
  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean;
  __dhis2Id: string;
  __dhis2type: string;

  static getType(): string {
    return 'dhis2plugin';
  }

  static clone(node: Dhis2PluginNode): Dhis2PluginNode {
    return new Dhis2PluginNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
      node.__dhis2Id,
      node.__dhis2type
    );
  }

  static importJSON(serializedNode: SerializedDhis2PluginNode): Dhis2PluginNode {
    const {altText, height, width, maxWidth, caption, src, showCaption, dhis2Id, dhis2type} =
      serializedNode;
    const node = $createDhis2PluginNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      dhis2Id,
      dhis2type
    });
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption?.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    element.setAttribute('maxWidth', this.__maxWidth.toString());
    element.setAttribute('dhis2Id', this.__dhis2Id.toString());
    element.setAttribute('id', this.__dhis2Id.toString());
    element.setAttribute('dhis2type', this.__dhis2type.toString());
    element.setAttribute('data-lexical-dhis2plugin', this.__dhis2Id);
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: HTMLElement) => ({
        conversion: convertDhis2PluginElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src?: string,
    altText?: string,
    maxWidth?: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    showCaption?: boolean,
    caption?: LexicalEditor,
    captionsEnabled?: boolean,
    key?: NodeKey,
    //@ts-ignore
    dhis2Id: string,
    dhis2type: string
  ) {
   
    super(key);
    this.__src = src || '';
    this.__altText = altText || '';
    this.__maxWidth = maxWidth || 1280;
    this.__width = width || 350;
    this.__height = height || 250;
    this.__showCaption = showCaption || false;
    this.__caption = caption || createEditor();
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
    this.__dhis2Id = dhis2Id;
    this.__dhis2type = dhis2type;
  }

  exportJSON(): SerializedDhis2PluginNode {
    return ({
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      //@ts-ignore
      height: this.getHeight() === 'inherit' ? 250 : this.getHeight(),
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc() || '',
      type: 'dhis2plugin',
      version: 1,
      //@ts-ignore
      width: this.getWidth() === 'inherit' ? 350: this.getWidth(),
      dhis2Id: this.getDhis2Id(),
      dhis2type: this.getDhis2Type(),
    });
  }

  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }
 
  getDhis2Id(): string {
    return this.__dhis2Id;
  }

  getDhis2Type(): string {
    return this.__dhis2type;
  }

  getWidth(): number | 'inherit' {
    return this.__width;
  }

  getHeight(): number | 'inherit' {
    return this.__height;
  }

  setSrc(name: string): void {
    const writable = this.getWritable();
    writable.__src = name;
  }

  onSrcChange = (newName: string, editor: LexicalEditor) => {
    editor.update(() => {
      const node = $getNodeByKey(this.getKey()) as Dhis2PluginNode;
      if (node !== null && $isDhis2PluginNode(node)) {
        node.setSrc(newName);
      }
    });
  }
          
  decorate(_editor: LexicalEditor): JSX.Element | null {
    return (
      <Suspense fallback={null}>
        <Dhis2PluginComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          captionsEnabled={this.__captionsEnabled}
          resizable={true}
          dhis2Id={ this.__dhis2Id}
          dhis2type={ this.__dhis2type}
        />
      </Suspense>
    );
  }
}

export function $createDhis2PluginNode({
  altText,
  height,
  maxWidth = 1280,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
  dhis2Id,
  dhis2type
}: Dhis2PluginPayload): Dhis2PluginNode {
  return $applyNodeReplacement(
    new Dhis2PluginNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      key,
      dhis2Id,
      dhis2type
    ),
  );
}

export function $isDhis2PluginNode(
  node: LexicalNode | null | undefined,
): node is Dhis2PluginNode {
  return node instanceof Dhis2PluginNode;
}