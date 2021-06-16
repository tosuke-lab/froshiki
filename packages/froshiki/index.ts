import { parse, ESTree } from "meriyah";
import * as astring from "astring";
import fs from "fs";
import { visitEachChild, visitNode, visitNodes, Visitor } from "./visitor";
import { isBindingPattern } from "./node";

const ast = parse(fs.readFileSync("./test.js", { encoding: "utf8" }), {
  module: true,
});

function collectTopLevelIdentifiers(program: ESTree.Program) {
  const ids: ESTree.Identifier[] = [];

  const visitBindingPattern = (node: ESTree.Node) => {
    switch (node.type) {
      case "Identifier":
        ids.push(node);
        break;
      case "ArrayPattern":
        visitNodes(node.elements, visitBindingPattern);
        break;
      case "ObjectPattern":
        node.properties.forEach((n) => {
          switch (n.type) {
            case "Property":
              visitNode(n.value, visitBindingPattern);
              break;
            case "RestElement":
              visitNode(n.argument, visitBindingPattern);
              break;
          }
        });
        break;
      default:
        // @ts-expect-error
        const _node: ESTree.BindingPattern = node;
        break;
    }
  };

  const visitor: Visitor = (node) => {
    switch (node.type) {
      case "VariableDeclaration":
        node.declarations.forEach((node) => {
          if (isBindingPattern(node.id)) {
            visitBindingPattern(node.id);
          }
        });
        break;
      case "FunctionDeclaration":
        if (node.id) {
          ids.push(node.id);
        }
        break;
      case "ClassDeclaration":
        if (node.id) {
          ids.push(node.id);
        }
    }
  };

  visitEachChild(program, visitor);

  return ids;
}

const ids = collectTopLevelIdentifiers(ast);
ids.forEach((id) => {
  id.name = `${id.name}$$1234`;
});
console.log(ids);

console.log(astring.generate(ast));
