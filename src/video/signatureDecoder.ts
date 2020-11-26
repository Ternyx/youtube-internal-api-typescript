export interface TransformFunction {
    var: string,
    name: string,
    arg: number
}

export type CipherFunctionObj = { [name: string]: CipherFunction };

export type CipherFunction = (charArr: string[], arg: number) => string[];

export default class SignatureDecoder {
    constructor(
        private transformFunctions: TransformFunction[],
        private cipherFunctions: CipherFunctionObj
    ) { }

   decode(signature: string) {
        let sigCharArr = [...decodeURIComponent(signature)]

        for (let { name, arg } of this.transformFunctions) {
            sigCharArr = this.cipherFunctions[name](sigCharArr, arg);
        }

        return sigCharArr.join('');
   }
}
