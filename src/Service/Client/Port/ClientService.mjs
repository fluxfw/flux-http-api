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
    async request(request) {
        return (await import("../Command/RequestCommand.mjs")).RequestCommand.new()
            .request(
                request
            );
    }
}
