import fs from "fs";

export class JsonFileReader<T> {
    private readonly path: string

    constructor(path: string) {
        this.path = path
        const file = this.file()

        if (!fs.existsSync(file)) {
            console.debug(`file does not exist at path ${path}`)
            fs.openSync(file, "w")
            fs.writeFileSync(file, "[]")
        } else {
            console.debug(`file exists at path ${path}, doing nothing`)
        }
    }

    write(input: T) {
        fs.writeFileSync(this.file(), JSON.stringify(input, null, 2))
    }

    getJson(): T {
        const string = fs.readFileSync(this.file(), {encoding: "utf8"})
        return JSON.parse(string)
    }

    private file(): string {
        return __dirname + this.path
    }
}
