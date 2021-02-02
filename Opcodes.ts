// eslint-disable-next-line @typescript-eslint/naming-convention
const GroovyLexer = require("./parsers/GroovyLexer");

export const ACC_PUBLIC: number = 0x0001; // class, field, method
export const ACC_PRIVATE: number = 0x0002; // class, field, method
export const ACC_PROTECTED: number = 0x0004; // class, field, method
export const ACC_STATIC: number = 0x0008; // field, method
export const ACC_FINAL: number = 0x0010; // class, field, method, parameter
export const ACC_SUPER: number = 0x0020; // class
export const ACC_SYNCHRONIZED: number = 0x0020; // method
export const ACC_VOLATILE: number = 0x0040; // field
export const ACC_BRIDGE: number = 0x0040; // method
export const ACC_VARARGS: number = 0x0080; // method
export const ACC_TRANSIENT: number = 0x0080; // field
export const ACC_NATIVE: number = 0x0100; // method
export const ACC_INTERFACE: number = 0x0200; // class
export const ACC_ABSTRACT: number = 0x0400; // class, method
export const ACC_STRICT: number = 0x0800; // method
export const ACC_SYNTHETIC: number = 0x1000; // class, field, method, parameter
export const ACC_ANNOTATION: number = 0x2000; // class
export const ACC_ENUM: number = 0x4000; // class(?) field inner
export const ACC_MANDATED: number = 0x8000; // parameter

export const MODIFIER_OPCODE_MAP = new Map([
            [GroovyLexer.DEF, 0],
            [GroovyLexer.VAR, 0],

            [GroovyLexer.NATIVE, ACC_NATIVE],
            [GroovyLexer.SYNCHRONIZED, ACC_SYNCHRONIZED],
            [GroovyLexer.TRANSIENT, ACC_TRANSIENT],
            [GroovyLexer.VOLATILE, ACC_VOLATILE],

            [GroovyLexer.PUBLIC, ACC_PUBLIC],
            [GroovyLexer.PROTECTED, ACC_PROTECTED],
            [GroovyLexer.PRIVATE, ACC_PRIVATE],
            [GroovyLexer.STATIC, ACC_STATIC],
            [GroovyLexer.ABSTRACT, ACC_ABSTRACT],
            [GroovyLexer.FINAL, ACC_FINAL],
            [GroovyLexer.STRICTFP, ACC_STRICT],
            [GroovyLexer.DEFAULT, 0] // no flag for specifying a default method in the JVM spec, hence no ACC_DEFAULT flag in ASM
]);