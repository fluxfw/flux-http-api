import MIME_DB from "mime-db/db.json" with { type: "json" };

export class GetMimeTypeByExtension {
    /**
     * @returns {Promise<GetMimeTypeByExtension>}
     */
    static async new() {
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
