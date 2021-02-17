import { checkServerIdentity } from "tls";
import Token from "../syntax/Token";
import BinaryExpression from "./BinaryExpression";
import Expression from "./Expression";
import TupleExpression from "./TupleExpression";
import VariableExpression from "./VariableExpression";

function check(left: Expression) {
    if (left instanceof VariableExpression) {
        // nothing
    } else if (left instanceof TupleExpression) {
        if ((left as TupleExpression).expressions.length <= 0) {
            throw new Error("On element required for left side");
        }
    } else {
        throw new Error("Illegal left expression");
    }
}

export default class DeclarationExpression extends BinaryExpression {
    constructor(left: Expression, operation: Token, right: Expression) {
        super(left, operation, right);
        check(left);
    }

    get isMultipleAssignmentDeclaration() {
        return this.leftExpression instanceof TupleExpression;
    }
    get variableExpression(): VariableExpression | null {
        return (this.leftExpression instanceof VariableExpression) ? (this.leftExpression as VariableExpression) : null;
    }
    get tupleExpression(): TupleExpression | null {
        return (this.leftExpression instanceof TupleExpression) ? (this.leftExpression as TupleExpression) : null;
    }

    getText(): string {
        let text = "";

        if (!this.isMultipleAssignmentDeclaration) {
            let v: VariableExpression|null = this.variableExpression;
            if (v && v.isDynamicTyped) {
                text += "def";
            } else {
                text += v?.type;
            }
            text += ' ' + v?.getText();
        } else {
            let t: TupleExpression|null = this.tupleExpression;
            text += "def (";
            t?.expressions.forEach((e) => {
                if (e instanceof VariableExpression) {
                    let v: VariableExpression = e as VariableExpression;
                    if (!v.isDynamicTyped) {
                        text += v.type + ' ';
                    }
                }
                text += e.getText() + ", ";
            });
            text.replace(/..$/, ")");
        }
        text += ' ' + this.getOperation().getText();
        text += ' ' + this.rightExpression.getText();

        return text;
    }
}