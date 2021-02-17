import Expression from "./Expression";
import Variable from "../Variable";
import ClassNode from "../ClassNode";
import CodeVisitor from "../CodeVisitor";

export default class VariableExpression extends Expression implements Variable {
    public variable: string;
    public accessedVariable: Variable|null = null;
    public originType: ClassNode;
    public isDynamicTyped: boolean = false;
    private _type: ClassNode;
    private inStaticContext: boolean = false;

    constructor(variable: string, type: ClassNode);
    constructor(variable: string);
    constructor(variable: Variable);
    constructor(variable: string|Variable, type?: ClassNode) {
        super();
        let n: string;
        let t: ClassNode;
        if (typeof variable === "string") {
            n = variable;
            t = type || "dynamic";
        } else {
            n = variable.name;
            t = variable.originType;
            this.accessedVariable = variable;
        }
        this.variable = n;
        this.originType = t;
        this.isDynamicTyped ||= t === "dynamic";
        this._type = t;
    }

    set type(t: ClassNode) {
        this._type = t;
        this.isDynamicTyped ||= (t === "dynamic");
    }
    get type() { return this._type; }
    get name() { return this.variable; }
    get initialExpression(): Expression|null { return null; }
    get isInStaticContext(): boolean {
        if (this.accessedVariable !== null && this.accessedVariable !== this) {
            return this.accessedVariable.isInStaticContext;
        } 
        return this.inStaticContext;
    }

    visit(visitor: CodeVisitor): void {
        visitor.visitVariableExpression(this);
    }
}