export interface TransformFunction {
    var: string;
    name: string;
    arg: number;
}
export declare type CipherFunctionObj = {
    [name: string]: CipherFunction;
};
export declare type CipherFunction = (charArr: string[], arg: number) => string[];
export default class SignatureDecoder {
    private transformFunctions;
    private cipherFunctions;
    constructor(transformFunctions: TransformFunction[], cipherFunctions: CipherFunctionObj);
    decode(signature: string): string;
}
