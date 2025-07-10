import { execute } from "./execute"

export type System = {
    NAME: string,
    PATH: string,
    EVENT: string,
    execute: execute
    LANG_KEY: string
}