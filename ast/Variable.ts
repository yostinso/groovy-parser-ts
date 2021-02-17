import ClassNode from "./ClassNode";
import Expression from "./expr/Expression";

export default interface Variable {
    type: ClassNode;
    originType: ClassNode;
    name: string;
    initialExpression: Expression|null;
    isInStaticContext: boolean;
    isDynamicTyped: boolean;
}