"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SignatureDecoder {
    constructor(transformFunctions, cipherFunctions) {
        this.transformFunctions = transformFunctions;
        this.cipherFunctions = cipherFunctions;
    }
    decode(signature) {
        let sigCharArr = [...decodeURIComponent(signature)];
        for (let { name, arg } of this.transformFunctions) {
            sigCharArr = this.cipherFunctions[name](sigCharArr, arg);
        }
        return sigCharArr.join('');
    }
}
exports.default = SignatureDecoder;
