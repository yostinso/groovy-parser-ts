import ClassNode from "./ClassNode";

export default class VariableScope {
    parent: VariableScope|null = null;
    //classScope: ClassNode;
    inStaticContext: boolean = false;

    constructor(parent?: VariableScope) {
        this.parent = parent || null;
    }
}