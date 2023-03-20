import MIME_DB from "../../../mime-db/db.json" assert {type: "json"};

const MIME_DB_ENTRIES = Object.entries(MIME_DB);

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

        return MIME_DB_ENTRIES.find(([
            ,
            value
        ]) => value?.extensions?.includes(_extension) ?? false)?.[0] ?? null;
    }
}
