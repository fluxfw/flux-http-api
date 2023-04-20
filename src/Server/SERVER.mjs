import { STATUS_CODE_302 } from "../Status/STATUS_CODE.mjs";
import { DEFAULT_PORT_HTTP, DEFAULT_PORT_HTTPS } from "../Protocol/DEFAULT_PORT.mjs";

export const SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS = true;

export const SERVER_DEFAULT_FORWARDED_HEADERS = false;

export const SERVER_DEFAULT_LISTEN_HTTPS_PORT = DEFAULT_PORT_HTTPS;

export const SERVER_DEFAULT_LISTEN_HTTP_PORT = DEFAULT_PORT_HTTP;

export const SERVER_DEFAULT_NO_DATE = true;

export const SERVER_DEFAULT_NO_REFERRER = true;

export const SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS = false;

export const SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT = SERVER_DEFAULT_LISTEN_HTTPS_PORT;

export const SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE = STATUS_CODE_302;

export const SERVER_LISTEN_HTTPS_PORT_DISABLED = 0;

export const SERVER_LISTEN_HTTP_PORT_DISABLED = 0;