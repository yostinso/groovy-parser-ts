import ClosureExpression from "./ClosureExpression";
import Statement from "../stmt/Statement";
import Parameter from "../Parameter";
import { getParametersText } from "../AstToTextHelper";
import AstBuilder from "../AstBuilder";
import CodeVisitor from "../CodeVisitor";

export default class LambdaExpression extends ClosureExpression {
    serializable: boolean = false;
    constructor(parameters: Parameter[]|null, code: Statement) {
        super(parameters, code);
    }

    get text(): string {
        const paramText: string = getParametersText(this.parameters);
        if (paramText.length > 0) {
            return "(" + paramText + ") -> { ... }";
        } else {
            return "() -> { ... }";
        }
    }

    visit(visitor: CodeVisitor) {
        visitor.visitLambdaExpression(this);
    }
}