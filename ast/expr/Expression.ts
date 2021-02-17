import AnnotatedNode from "../AnnotatedNode";
import CodeVisitor from "../CodeVisitor";

export default abstract class Expression extends AnnotatedNode {
    abstract visit(visitor: CodeVisitor): void;
}
