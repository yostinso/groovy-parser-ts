export default class AnnotationNode {
public readonly CONSTRUCTOR_TARGET = 1 << 1;
public readonly METHOD_TARGET = 1 << 2;
public readonly FIELD_TARGET = 1 << 3;
public readonly PARAMETER_TARGET = 1 << 4;
public readonly LOCAL_VARIABLE_TARGET = 1 << 5;
public readonly ANNOTATION_TARGET = 1 << 6;
public readonly PACKAGE_TARGET = 1 << 7;
public readonly TYPE_PARAMETER_TARGET = 1 << 8;
public readonly TYPE_USE_TARGET = 1 << 9;
public readonly TYPE_TARGET = 1 + this.ANNOTATION_TARGET;    //GROOVY-7151
private readonly ALL_TARGETS = this.TYPE_TARGET | this.CONSTRUCTOR_TARGET | this.METHOD_TARGET
        | this.FIELD_TARGET | this.PARAMETER_TARGET | this.LOCAL_VARIABLE_TARGET | this.ANNOTATION_TARGET
        | this.PACKAGE_TARGET | this.TYPE_PARAMETER_TARGET | this.TYPE_USE_TARGET;
}