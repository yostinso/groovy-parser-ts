export default class GroovyCharacter {
    /* These are some cheap hacks to replace Java functions without impinging on Java source
        * Might be able to take an approach like https://github.com/google/re2j/pull/21 if you wanted
        * more accuracy.
        */
    static isJavaIdentifierPart = (char: number, char2?: number): boolean => {
        const s = char2 ? String.fromCodePoint(char, char2) : String.fromCharCode(char);
        return !!s.match(/^[a-zA-Z0-9_$]$/);
    };
    static isJavaIdentifierStart = (char: number | CodePoint): boolean => {
        const s = (typeof(char) === "number") ? String.fromCharCode(char) : String.fromCodePoint(...char);
        return !!s.match(/^[a-zA-Z_$]$/);
    };
    static isIdentifierIgnorable = (char: number): boolean => {
        return false;
    };
    static isUppercase = (char: number): boolean => {
        return char >= 65 && char <= 90;
    };
    static isLowercase = (char: number): boolean => {
        return char >= 97 && char <= 122;
    };
    static isJavaIdentifierStartAndNotIdentifierIgnorable(codePoint: number): boolean {
        return GroovyCharacter.isJavaIdentifierStart(codePoint) && !GroovyCharacter.isIdentifierIgnorable(codePoint);
    };
    static isJavaIdentifierPartAndNotIdentifierIgnorable(codePoint: number): boolean {
        return GroovyCharacter.isJavaIdentifierPart(codePoint) && !GroovyCharacter.isIdentifierIgnorable(codePoint);
    };
}

export type CodePoint = [number, number];