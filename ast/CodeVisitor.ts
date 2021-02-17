import BinaryExpression from "./expr/BinaryExpression";
import ClosureExpression from "./expr/ClosureExpression";
import DeclarationExpression from "./expr/DeclarationExpression";
import EmptyExpression from "./expr/EmptyExpression";
import Expression from "./expr/Expression";
import LambdaExpression from "./expr/LambdaExpression";
import TupleExpression from "./expr/TupleExpression";
import VariableExpression from "./expr/VariableExpression";
import BlockStatement from "./stmt/BlockStatement";
import ExpressionStatement from "./stmt/ExpressionStatement";

export default class CodeVisitor {
    visitListOfExpressions(list: Expression[]) {
        list.forEach((e) => e.visit(this));
    }
    visitLambdaExpression(expression: LambdaExpression) {
        this.visitClosureExpression(expression);
    }
    visitClosureExpression(expression: ClosureExpression) {
        expression.code.visit(this);
    }
    visitExpressionStatement(statement: ExpressionStatement) {
        statement.expression.visit(this);
    }
    visitBinaryExpression(expression: BinaryExpression) {
        expression.leftExpression.visit(this);
        expression.rightExpression.visit(this);
    }
    visitVariableExpression(expression: VariableExpression) {}
    visitBlockStatement(block: BlockStatement) {
        block.statements.forEach((s) => {
            s.visit(this);
        });
    }
    visitTupleExpression(expression: TupleExpression) {
        this.visitListOfExpressions(expression.expressions);
    }
    visitDeclarationExpression(expression: DeclarationExpression) {
        this.visitBinaryExpression(expression);
    }
    visitEmptyExpression(expression: EmptyExpression) {}
}