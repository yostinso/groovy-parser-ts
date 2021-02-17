import { stat } from "fs";
import Statement from "./Statement";
import VariableScope from "../VariableScope";
import CodeVisitor from "../CodeVisitor";

export default class BlockStatement extends Statement {
    statements: Statement[] = [];
    scope: VariableScope|null = null;

    constructor();
    constructor(statements: Statement[], scope: VariableScope);
    constructor(statements?: Statement[], scope?: VariableScope) {
        super();
        if (statements && scope) {
            this.statements = statements;
            this.scope = scope;
        }
    }
    visit(visitor: CodeVisitor) {
        visitor.visitBlockStatement(this);
    }
}