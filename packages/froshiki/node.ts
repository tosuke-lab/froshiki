import { ESTree } from "meriyah";

export function isBindingPattern(
  node: ESTree.Node
): node is ESTree.BindingPattern {
  return isIdentifier(node) || isArrayPattern(node) || isObjectPattern(node);
}

export function isArrayPattern(node: ESTree.Node): node is ESTree.ArrayPattern {
  return node.type === "ArrayPattern";
}

export function isObjectPattern(
  node: ESTree.Node
): node is ESTree.ObjectPattern {
  return node.type === "ObjectPattern";
}

export function isIdentifier(node: ESTree.Node): node is ESTree.Identifier {
  return node.type === "Identifier";
}
