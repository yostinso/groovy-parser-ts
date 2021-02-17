import { GroovyParserVisitor } from "../../parsers/GroovyParserVisitor";
import CodeVisitor from "../CodeVisitor";
import Expression from "../expr/Expression";
import Statement from "./Statement";

export default class ExpressionStatement extends Statement {
    public expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }

    visit(visitor: CodeVisitor) {
        visitor.visitExpressionStatement(this);
    }
}