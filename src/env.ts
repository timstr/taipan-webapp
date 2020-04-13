export function getEnvironmentVariable(name: string, required: true): string;
export function getEnvironmentVariable(
    name: string,
    required?: false | undefined
): string | null;
export function getEnvironmentVariable(
    name: string,
    required?: boolean
): string | null {
    const val = process.env[name];
    if (typeof val !== "string") {
        if (required === true) {
            console.error(`Please set the "${name}" environment variable`);
            throw new Error(`Missing environment variable "${name}"`);
        } else {
            console.log(
                `The optional environment variable "${name}" was not set`
            );
            return null;
        }
    }
    return val;
}
