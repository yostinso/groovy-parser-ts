import ASTNode from "./ASTNode";
import AnnotationNode from "./AnnotationNode";

interface GroovydocHolder<Doctype> {

}

export default class AnnotatedNode extends ASTNode implements GroovydocHolder<AnnotatedNode> {
    private annotations: AnnotationNode[] = []
}