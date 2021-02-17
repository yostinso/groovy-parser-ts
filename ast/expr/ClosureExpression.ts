import CodeVisitor from "../CodeVisitor";
import Parameter from "../Parameter";
import Statement from "../stmt/Statement";
import Expression from "./Expression";

export default class ClosureExpression extends Expression {
    public code: Statement;
    public parameters: Parameter[]|null;

    constructor(parameters: Parameter[]|null, code: Statement) {
        super();
        this.parameters = parameters;
        this.code = code;
    }

    visit(visitor: CodeVisitor) {
        visitor.visitClosureExpression(this);
    }
}