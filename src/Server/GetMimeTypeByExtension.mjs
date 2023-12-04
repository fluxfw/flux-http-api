import MIME_DB from "mime-db";

export class GetMimeTypeByExtension {
    /**
     * @returns {GetMimeTypeByExtension}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

    }

    /**
     * @param {string} extension
     * @returns {Promise<string | null>}
     */
    async getMimeTypeByExtension(extension) {
        const _extension = extension.toLowerCase();

        return Object.entries(MIME_DB).find(([
            ,
            value
        ]) => value?.extensions?.includes(_extension) ?? false)?.[0] ?? null;
    }
}
