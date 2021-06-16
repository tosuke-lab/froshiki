import { ESTree } from "meriyah";

interface WalkerContext {
  remove(parent: ESTree.Node, prop: string, index: number | null): void;
  replace(
    parent: ESTree.Node,
    prop: string,
    index: number | null,
    node: ESTree.Node
  ): void;
}

export type Visitor<Node extends ESTree.Node = ESTree.Node> = (
  this: WalkerContext,
  node: Node,
  parent: ESTree.Node | undefined,
  prop: string,
  index: number | null
) => Visitor | null;

type Handler = (
  this: WalkerContext,
  node: ESTree.Node,
  parent: ESTree.Node | undefined,
  prop: string,
  index: number | null
) => void;

function isNode(value: unknown): value is ESTree.Node {
  return value != null && typeof (value as any).type === "string";
}

export type WalkHandlers = {
  readonly enter?: Handler;
  readonly leave?: Handler;
};

class Walker implements WalkerContext {
  visit<Node extends ESTree.Node>(
    visitor: Visitor<Node>,
    node: Node,
    parent: ESTree.Node | undefined,
    prop: string,
    index: number | null
  ) {
    const nextVisitor = visitor.call(this, node, parent, prop, index);
    if (nextVisitor === null) return;

    for (const key in node) {
      const value = (node as ESTree.Node & Record<string, unknown>)[key];
      if (typeof value !== "object") {
        continue;
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const v = value[i];
          if (isNode(v)) {
            this.visit(nextVisitor, v, node, key, i);
          }
        }
      } else if (isNode(value)) {
        this.visit(nextVisitor, value, node, key, null);
      }
    }
  }

  remove(parent: ESTree.Node, prop: string, index: number | null) {
    const p = parent as ESTree.Node & Record<string, unknown>;
    if (index !== null) {
      (p[prop] as Array<unknown>).splice(index, 1);
    } else {
      delete p[prop];
    }
  }

  replace(
    parent: ESTree.Node,
    prop: string,
    index: number | null,
    node: ESTree.Node
  ) {
    const p = parent as ESTree.Node & Record<string, unknown>;
    if (index !== null) {
      (p[prop] as Array<unknown>)[index] = node;
    } else {
      p[prop] = node;
    }
  }
}

export function walk<Node extends ESTree.Node>(
  root: Node,
  visitor: Visitor<Node>
) {
  new Walker().visit(visitor, root, undefined, "", null);
}
