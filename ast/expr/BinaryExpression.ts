import AstBuilder from "../AstBuilder";
import Expression from "./Expression";
import Token from "../syntax/Token";
import Types from "../syntax/Types";
import CodeVisitor from "../CodeVisitor";

export default class BinaryExpression extends Expression {
    public readonly leftExpression: Expression;
    public readonly operation: Token;
    public readonly rightExpression: Expression;
    public readonly safe: boolean;

    constructor(leftExpression: Expression, operation: Token, rightExpression: Expression);
    constructor(leftExpression: Expression, operation: Token, rightExpression: Expression, safe: boolean);

    constructor(leftExpression: Expression, operation: Token, rightExpression: Expression, safe?: boolean) {
        super();
        this.leftExpression = leftExpression;
        this.operation = operation;
        this.rightExpression = rightExpression;
        this.safe = safe || false;
    }
    public getOperation(): Token  {
        return this.operation;
    }
    visit(visitor: CodeVisitor) {
        visitor.visitBinaryExpression(this);
    }
    public getText(): string {
        if (this.operation.getType() == Types.LEFT_SQUARE_BRACKET) {
            return this.leftExpression.getText() + (this.safe ? "?" : "") + "[" + this.rightExpression.getText() + "]";
        }
        return "(" + this.leftExpression.getText() + " " + this.operation.getText() + " " + this.rightExpression.getText() + ")";
    }
}