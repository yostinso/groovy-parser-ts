import Parameter from "./Parameter";

function getParameterText(node: Parameter): string {
    if (node == null) return "<unknown>";

        let name: string = node.name == null ? "<unknown>" : node.name;
        let type: string = node.type;
        if (node.initialExpression != null) {
            return type + " " + name + " = " + node.initialExpression.getText();
        }
        return type + " " + name;
}
function getParametersText(parameters: Parameter[] | null): string {
    if (parameters === null || parameters.length === 0) { return ""; }
    return parameters.map((p) => getParameterText(p)).join(", ");
}

export {
    getParametersText
}