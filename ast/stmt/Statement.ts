import ASTNode from "../ASTNode";
import CodeVisitor from "../CodeVisitor";

export default abstract class Statement extends ASTNode {
    public statementLabels: string[] = [];
    abstract visit(visitor: CodeVisitor): void;
}