/** @typedef {import("../../../Adapter/Fetch/Fetch.mjs").Fetch} Fetch */
/** @typedef {import("../../../Adapter/Fetch/fetchAuthenticate.mjs").fetchAuthenticate} fetchAuthenticate */
/** @typedef {import("../../../Adapter/Fetch/fetchShowError.mjs").fetchShowError} fetchShowError */

export class FetchService {
    /**
     * @type {fetchAuthenticate | null}
     */
    #fetch_authenticate;
    /**
     * @type {fetchShowError | null}
     */
    #fetch_show_error;

    /**
     * @param {fetchAuthenticate | null} fetch_authenticate
     * @param {fetchShowError | null} fetch_show_error
     * @returns {FetchService}
     */
    static new(fetch_authenticate = null, fetch_show_error = null) {
        return new this(
            fetch_authenticate,
            fetch_show_error
        );
    }

    /**
     * @param {fetchAuthenticate | null} fetch_authenticate
     * @param {fetchShowError | null} fetch_show_error
     * @private
     */
    constructor(fetch_authenticate, fetch_show_error) {
        this.#fetch_authenticate = fetch_authenticate;
        this.#fetch_show_error = fetch_show_error;
    }

    /**
     * @param {Fetch} _fetch
     * @returns {Promise<*>}
     */
    async fetch(_fetch) {
        return (await import("../Command/FetchCommand.mjs")).FetchCommand.new(
            this.#fetch_authenticate,
            this.#fetch_show_error
        )
            .fetch(
                _fetch
            );
    }
}
