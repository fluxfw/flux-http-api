/** @typedef {import("../../../Adapter/Client/HttpClientRequest.mjs").HttpClientRequest} HttpClientRequest */
/** @typedef {import("../../../Adapter/Client/HttpClientResponse.mjs").HttpClientResponse} HttpClientResponse */
/** @typedef {import("../../../Adapter/RequestImplementation/RequestImplementation.mjs").RequestImplementation} RequestImplementation */

export class ClientService {
    /**
     * @type {RequestImplementation}
     */
    #request_implementation;

    /**
     * @param {RequestImplementation} request_implementation
     * @returns {ClientService}
     */
    static new(request_implementation) {
        return new this(
            request_implementation
        );
    }

    /**
     * @param {RequestImplementation} request_implementation
     * @private
     */
    constructor(request_implementation) {
        this.#request_implementation = request_implementation;
    }

    /**
     * @param {HttpClientRequest} request
     * @returns {Promise<HttpClientResponse>}
     */
    async request(request) {
        return (await import("../Command/RequestCommand.mjs")).RequestCommand.new(
            this.#request_implementation
        )
            .request(
                request
            );
    }
}
