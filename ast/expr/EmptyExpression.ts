import CodeVisitor from "../CodeVisitor";
import Expression from "./Expression";

export default class EmptyExpression extends Expression {
    constructor() {
        super();
    }
    visit(visitor: CodeVisitor) {
        visitor.visitEmptyExpression(this);
    }

    static INSTANCE: EmptyExpression = new EmptyExpression();
}