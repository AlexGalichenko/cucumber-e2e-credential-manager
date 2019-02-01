const path = require("path");
const request = require("request-promise");
const defaultUrl = "http://localhost:3099/credentials";
const CredentialServer = require("./CredentialServer");
/**
 * Class representing Credential Manager
 */
class ServerCredentialManager {

    /**
     * Start credential server
     * @param {number} [port] - port to listen
     */
    static start(port) {
        if (!port) {
            port = 3099;
        }
        this.server = new CredentialServer();
        return this.server.start(port);
    }

    static stop() {
        return this.server.stop()
    }

    /**
     * Set base url to get credential server
     * @param {string} url - url
     */
    static setBaseUrl(url) {
        this.serviceUrl = url + "/credentials";
    }

    /**
     * Create pool of userIds based on creds object
     * @param {Object} creds - set of user credentials
     * @param {string} [pool] - name of pool
     * @throws {Error}
     * @example CredentialManager.createPool(credentials);
     */
    static createPool(creds, pool) {
        let requestURI = this.serviceUrl || defaultUrl;
        if (pool) {
            requestURI += "?pool=" + pool;
        }

        return request({
            method: "POST",
            uri: requestURI,
            body: creds,
            json: true
        })
        .catch(e => {
            throw new Error("Credential pool has not been created")
        })
    }

    /**
     * Return free credentials from pool
     * @return {Promise<Object>} - promise that resolves with set of credentials
     * @throws {Error}
     * @example
     * CredentialManager.getCredentials();
     * const currentCredentials = await CredentialManager.credentials;
     * @return {*}
     */
    static getCredentials(pool) {
        if (!this.credentials) {
            let requestURI = this.serviceUrl || defaultUrl;
            if (pool) {
                this.pool = pool;
                requestURI += "?pool=" + pool;
            }
            this.credentials = request({
                method: "GET",
                uri: requestURI,
            })
            .then(body => JSON.parse(body))
            .catch(e => {
                throw e
            });
        }

        return this.credentials
    }

    /**
     * Free credentials
     * @throws {Error}
     * @example CredentialManager.freeCredentials();
     */
    static freeCredentials() {
        let requestURI = this.serviceUrl || defaultUrl;
        if (this.pool) {
            requestURI += "?pool=" + this.pool;
        }
        return this.credentials.then(credentials => {
            if (credentials) {
                return request({
                    method: "PUT",
                    uri: requestURI,
                    body: {
                        username: credentials.username
                    },
                    json: true
                })
            }
        })
        .catch(e => {
            throw e
        })
    }

    /**
     * Free credentials
     * @param property - property to update
     * @param value - value to update
     * @throws {Error}
     * @example CredentialManager.updateProperty("cookie", "myCookie");
     */
    static updateProperty(property, value) {
        const url = this.serviceUrl || defaultUrl;
        let requestURI = url + "/update";
        if (this.pool) {
            requestURI += "?pool=" + this.pool;
        }
        return this.credentials.then(credentials => {
            if (credentials) {
                return request({
                    method: "PUT",
                    uri: requestURI,
                    body: {
                        username: credentials.username,
                        property: property,
                        value: value
                    },
                    json: true
                })
            }
        })
        .catch(e => {
            throw e
        })
    }

    /**
     * Return specified credentials by username
     * @param username - username to get
     * @param [pool] - pool to update
     * @return {Promise<Object>} - promise that resolves with set of credentials
     * @throws {Error}
     * @example
     * CredentialManager.getCredentialsByUsername(ta1@email.com);
     * const currentCredentials = await CredentialManager.credentials;
     */
    static getCredentialsByUsername(username, pool) {
        const url = this.serviceUrl || defaultUrl;
        let requestURI = url + "/" + username;
        if (pool) {
            requestURI += "?pool=" + pool;
        }
        this.credentials = request({
            method: "GET",
            uri: requestURI,
        })
        .then(body => JSON.parse(body))
        .catch(e => {
            throw e
        })
    }

}

module.exports = ServerCredentialManager;
