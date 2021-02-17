import CodeVisitor from "../CodeVisitor";
import Expression from "./Expression";

function notEmpty(e: Expression | undefined): e is Expression {
    return e !== null;
}

export default class TupleExpression extends Expression {
    expressions: Expression[] = [];
    constructor();
    constructor(expr: Expression);
    constructor(expr1: Expression, expr2: Expression);
    constructor(expr1: Expression, expr2: Expression, expr3: Expression);
    constructor(expr1?: Expression, expr2?: Expression, expr3?: Expression) {
        super();
        this.expressions = [ expr1, expr2, expr3 ].filter(notEmpty);
    }

    visit(visitor: CodeVisitor) {
        visitor.visitTupleExpression(this);
    }
}