import { HttpResponse } from "../../../Adapter/Response/HttpResponse.mjs";
import { STATUS_416 } from "../../../Adapter/Status/STATUS.mjs";
import { HEADER_ACCEPT_RANGES, HEADER_CONTENT_RANGE, HEADER_RANGE } from "../../../Adapter/Header/HEADER.mjs";

/** @typedef {import("../../../Adapter/Request/HttpRequest.mjs").HttpRequest} HttpRequest */
/** @typedef {import("../../../Adapter/Range/RangeUnit.mjs").RangeUnit} RangeUnit */
/** @typedef {import("../../../Adapter/Range/RangeValue.mjs").RangeValue} RangeValue */

export class ValidateRangesCommand {
    /**
     * @returns {ValidateRangesCommand}
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
     * @param {HttpRequest} request
     * @param {RangeUnit[]} units
     * @returns {Promise<RangeValue | HttpResponse | null>}
     */
    async validateRanges(request, units) {
        request._res?.setHeader(HEADER_ACCEPT_RANGES, units.map(_unit => _unit.name).join(", "));

        const range_header = request.header(
            HEADER_RANGE
        );

        if (range_header === null) {
            return null;
        }

        const [
            __unit,
            ..._ranges
        ] = range_header.split("=");

        const unit = units.find(_unit => _unit.name === __unit) ?? null;

        if (unit === null) {
            return this.#response416(
                units[0] ?? null
            );
        }

        const ranges = _ranges.join("=").split(",").map(range => {
            const [
                start,
                ...end
            ] = range.trim().split("-");

            return {
                start: this.#stringToNumber(
                    start
                ),
                end: this.#stringToNumber(
                    end.join("-")
                )
            };
        });

        if (!ranges.every(range => {
            if (typeof range.start === "number" && range.end === "") {
                range.end = unit.total_length - 1;
            }

            if (range.start === "" && typeof range.end === "number") {
                range.start = unit.total_length - range.end;
                range.end = unit.total_length - 1;
            }

            if (typeof range.start === "number" && typeof range.end === "number") {
                if (range.start < 0 || range.start > range.end || range.end > unit.total_length - 1) {
                    return false;
                }

                range.unit = unit;
                range.length = range.end - range.start + 1;
                range.range = this.#range(
                    unit,
                    `${range.start}-${range.end}`
                );

                return true;
            }

            return false;
        }) || ranges.length !== 1) {
            return this.#response416(
                unit
            );
        }

        return ranges[0];
    }

    /**
     * @param {RangeUnit | null} unit
     * @param {string | null} range
     * @returns {string}
     */
    #range(unit = null, range = null) {
        return `${unit?.name ?? "*"} ${range ?? "*"}/${unit?.total_length ?? "*"}`;
    }

    /**
     * @param {RangeUnit | null} unit
     * @returns {HttpResponse}
     */
    #response416(unit = null) {
        return HttpResponse.new(
            null,
            STATUS_416,
            {
                [HEADER_CONTENT_RANGE]: this.#range(
                    unit
                )
            }
        );
    }

    /**
     * @param {string} number
     * @returns {number | string}
     */
    #stringToNumber(number) {
        if (!/^\d+$/.test(number)) {
            return number;
        }

        return parseInt(number);
    }
}
