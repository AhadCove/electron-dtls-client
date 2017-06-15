import * as TLSTypes from "./TLSTypes";
import { TLSStruct } from "./TLSStruct";
export default class Extension extends TLSStruct {
    extension_type: ExtensionType;
    extension_data: number[];
    static readonly __spec: {
        extension_type: TLSTypes.Enum;
        extension_data: TLSTypes.Vector;
    };
    constructor(extension_type: ExtensionType, extension_data: number[]);
}
export declare enum ExtensionType {
    signature_algorithms = 13,
}
export declare namespace ExtensionType {
    const __spec: TLSTypes.Enum;
}
