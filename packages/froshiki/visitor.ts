import type { ESTree } from "meriyah";

export type Visitor = (node: ESTree.Node) => void;

function isNode(value: unknown): value is ESTree.Node {
  return (
    typeof value === "object" &&
    value != null &&
    typeof (value as any).type === "string"
  );
}

export function visitNode<Node extends ESTree.Node>(
  node: Node,
  visitor: Visitor
): void {
  visitor(node);
}

export function visitNodes<Node extends ESTree.Node>(
  nodes: readonly Node[],
  visitor: Visitor
) {
  nodes.forEach(visitor);
}

export function visitEachChild<Node extends ESTree.Node>(
  node: Node,
  visitor: Visitor
): void {
  for (const key in node) {
    const value = (node as ESTree.Node & Record<string, unknown>)[key];
    if (isNode(value)) {
      visitNode(value, visitor);
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (isNode(item)) {
          visitNode(item, visitor);
        }
      }
    }
  }
}
