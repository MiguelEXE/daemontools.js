interface Option {
    option: string
    optarg?: string
};
declare module "posix-getopt" {
    export class BasicParser {
        constructor(opt: string, argv: string[]);
        getopt(): Option | undefined;
        optind(): number
    }
};