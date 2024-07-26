

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  RangeSelection,
  Spread,
} from 'lexical';

import {BlockWithAlignableContents} from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import * as React from 'react';

type Dhis2ComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  dhis2ID: string;
}>;

function Dhis2Component({
  className,
  format,
  nodeKey,
  dhis2ID
}: Dhis2ComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      { "{{ dhis2 "+ dhis2ID + " }}" }
    </BlockWithAlignableContents>
  );
}

export type SerializedDhis2Node = Spread<
  {
    dhis2ID: string;
  },
  SerializedDecoratorBlockNode
>;

function convertDhis2Element(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const dhis2ID = domNode.getAttribute('data-lexical-dhis2');
  if (dhis2ID) {
    const node = $createDhis2Node(dhis2ID);
    return {node};
  }
  return null;
}

export class Dhis2Node extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return 'dhis2';
  }

  static clone(node: Dhis2Node): Dhis2Node {
    return new Dhis2Node(node.__id,node.__format, node.__key );
  }

  static importJSON(serializedNode: SerializedDhis2Node):Dhis2Node {
    const node = $createDhis2Node(serializedNode.dhis2ID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedDhis2Node {
    return {
      ...super.exportJSON(),
      type: 'dhis2',
      version: 1,
      dhis2ID: this.__id
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-dhis2', this.__id);
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-dhis2')) {
          return null;
        }
        return {
          conversion: convertDhis2Element,
          priority: 1,
        };
      },
    };
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('span');
    elem.style.display = 'inline-block';
    return elem;
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <Dhis2Component
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        dhis2ID={this.__id}
      />
    );
  }
}

export function $createDhis2Node(dhis2ID: string): Dhis2Node {
  return new Dhis2Node(dhis2ID);
}

export function $isDhis2Node(
  node: Dhis2Node | LexicalNode | null | undefined,
): node is Dhis2Node {
  return node instanceof Dhis2Node;
}
