import ClassNode from "./ClassNode";
import Expression from "./expr/Expression";

class ClassHelper {
    public static DYNAMIC_TYPE = "dynamic";
}

export default class Parameter {
    _type: ClassNode;
    name: string | null;
    dynamicTyped: boolean = false;
    defaultValue: Expression | null = null;
    hasDefaultValue: boolean = false;

    constructor(type: ClassNode, name: string|null, defaultValue: Expression);
    constructor(type: ClassNode, name: string|null);
    constructor(type: ClassNode, name: string|null, defaultValue?: Expression) {
        this.name = name;
        this._type = type;
        this.type = type;
        if (defaultValue !== undefined) {
            this.hasDefaultValue = !!defaultValue;
        }
    }

    get initialExpression(): Expression | null {
        return this.defaultValue;
    }
    set initialExpression(init: Expression | null) {
        this.defaultValue = init;
        this.hasDefaultValue = init !== null;
    }

    get type(): ClassNode {
        return this._type;
    }
    set type(type: ClassNode) {
        this._type = type;
        this.dynamicTyped = (this.dynamicTyped || type == ClassHelper.DYNAMIC_TYPE);
    }
}