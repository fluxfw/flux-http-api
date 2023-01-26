/** @typedef {import("../../../Adapter/Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */
/** @typedef {import("../../../Adapter/Client/HttpClientResponse.mjs").HttpClientResponse} HttpClientResponse */

export class ClientService {
    /**
     * @returns {ClientService}
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
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async fetch(request) {
        return (await import("../Command/FetchCommand.mjs")).FetchCommand.new()
            .fetch(
                request
            );
    }
}
