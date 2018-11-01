var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as dgram from "dgram";
import { EventEmitter } from "events";
import { FragmentedHandshake } from "./DTLS/Handshake";
import { ClientHandshakeHandler } from "./DTLS/HandshakeHandler";
import { RecordLayer } from "./DTLS/RecordLayer";
import { Alert, AlertDescription, AlertLevel } from "./TLS/Alert";
import { ContentType } from "./TLS/ContentType";
import { TLSStruct } from "./TLS/TLSStruct";
// enable debug output
import * as debugPackage from "debug";
var debug = debugPackage("electron-dtls-client");
export var dtls;
(function (dtls) {
    /**
     * Creates a DTLS-secured socket.
     * @param options - The options used to create the socket
     * @param callback - If provided, callback is bound to the "message" event
     */
    function createSocket(options, callback) {
        checkOptions(options);
        var ret = new Socket(options);
        // bind "message" event after the handshake is finished
        if (callback != null) {
            ret.once("connected", function () {
                ret.on("message", callback);
            });
        }
        return ret;
    }
    dtls.createSocket = createSocket;
    /**
     * DTLS-secured UDP socket. Can be used as a drop-in replacement for dgram.Socket
     */
    var Socket = /** @class */ (function (_super) {
        __extends(Socket, _super);
        /**
         * INTERNAL USE, DON'T CALL DIRECTLY. use createSocket instead!
         */
        function Socket(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this._handshakeFinished = false;
            // buffer messages while handshaking
            _this.bufferedMessages = [];
            _this._isClosed = false;
            // setup the connection
            _this.udp = dgram
                .createSocket(options)
                .on("listening", _this.udp_onListening.bind(_this))
                .on("message", _this.udp_onMessage.bind(_this))
                .on("close", _this.udp_onClose.bind(_this))
                .on("error", _this.udp_onError.bind(_this));
            // setup a timeout watcher. Default: 1000ms timeout, minimum: 100ms
            _this.options.timeout = Math.max(100, _this.options.timeout || 1000);
            _this._udpConnected = false;
            _this._connectionTimeout = setTimeout(function () { return _this.expectConnection(); }, _this.options.timeout);
            // start the connection
            _this.udp.bind();
            return _this;
        }
        /**
         * Send the given data. It is automatically compressed and encrypted.
         */
        Socket.prototype.send = function (data, callback) {
            if (this._isClosed) {
                throw new Error("The socket is closed. Cannot send data.");
            }
            if (!this._handshakeFinished) {
                throw new Error("DTLS handshake is not finished yet. Cannot send data.");
            }
            // send finished data over UDP
            var packet = {
                type: ContentType.application_data,
                data: data,
            };
            this.recordLayer.send(packet, callback);
        };
        /**
         * Closes the connection
         */
        Socket.prototype.close = function (callback) {
            var _this = this;
            this.sendAlert(new Alert(AlertLevel.warning, AlertDescription.close_notify), function (e) {
                _this.udp.close();
                if (callback)
                    _this.once("close", callback);
            });
        };
        Socket.prototype.udp_onListening = function () {
            var _this = this;
            // connection successful
            this._udpConnected = true;
            if (this._connectionTimeout != null)
                clearTimeout(this._connectionTimeout);
            // initialize record layer
            this.recordLayer = new RecordLayer(this.udp, this.options);
            // reuse the connection timeout for handshake timeout watching
            this._connectionTimeout = setTimeout(function () { return _this.expectHandshake(); }, this.options.timeout);
            // also start handshake
            this.handshakeHandler = new ClientHandshakeHandler(this.recordLayer, this.options, function (alert, err) {
                var nextStep = function () {
                    // if we have an error, terminate the connection
                    if (err) {
                        // something happened on the way to heaven
                        _this.killConnection(err);
                    }
                    else {
                        // when done, emit "connected" event
                        _this._handshakeFinished = true;
                        if (_this._connectionTimeout != null)
                            clearTimeout(_this._connectionTimeout);
                        _this.emit("connected");
                        // also emit all buffered messages
                        for (var _i = 0, _a = _this.bufferedMessages; _i < _a.length; _i++) {
                            var _b = _a[_i], msg = _b.msg, rinfo = _b.rinfo;
                            _this.emit("message", msg.data, rinfo);
                        }
                        _this.bufferedMessages = [];
                    }
                };
                // if we have an alert, send it to the other party
                if (alert) {
                    _this.sendAlert(alert, nextStep);
                }
                else {
                    nextStep();
                }
            });
        };
        // is called after the connection timeout expired.
        // Check the connection and throws if it is not established yet
        Socket.prototype.expectConnection = function () {
            if (!this._isClosed && !this._udpConnected) {
                // connection timed out
                this.killConnection(new Error("The connection timed out"));
            }
        };
        Socket.prototype.expectHandshake = function () {
            if (!this._isClosed && !this._handshakeFinished) {
                // handshake timed out
                this.killConnection(new Error("The DTLS handshake timed out"));
            }
        };
        Socket.prototype.sendAlert = function (alert, callback) {
            // send alert to the other party
            var packet = {
                type: ContentType.alert,
                data: alert.serialize(),
            };
            this.recordLayer.send(packet, callback);
        };
        Socket.prototype.udp_onMessage = function (udpMsg, rinfo) {
            // decode the messages
            var messages = this.recordLayer.receive(udpMsg);
            // TODO: implement retransmission.
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var msg = messages_1[_i];
                switch (msg.type) {
                    case ContentType.handshake:
                        var handshake = TLSStruct.from(FragmentedHandshake.spec, msg.data).result;
                        this.handshakeHandler.processIncomingMessage(handshake);
                        break;
                    case ContentType.change_cipher_spec:
                        this.recordLayer.advanceReadEpoch();
                        break;
                    case ContentType.alert:
                        var alert_1 = TLSStruct.from(Alert.spec, msg.data).result;
                        if (alert_1.level === AlertLevel.fatal) {
                            // terminate the connection when receiving a fatal alert
                            var errorMessage = "received fatal alert: " + AlertDescription[alert_1.description];
                            debug(errorMessage);
                            this.killConnection(new Error(errorMessage));
                        }
                        else if (alert_1.level === AlertLevel.warning) {
                            // not sure what to do with most warning alerts
                            switch (alert_1.description) {
                                case AlertDescription.close_notify:
                                    // except close_notify, which means we should terminate the connection
                                    this.close();
                                    break;
                            }
                        }
                        break;
                    case ContentType.application_data:
                        if (!this._handshakeFinished) {
                            // if we are still shaking hands, buffer the message until we're done
                            this.bufferedMessages.push({ msg: msg, rinfo: rinfo });
                        }
                        else /* finished */ {
                            // else emit the message
                            // TODO: extend params?
                            // TODO: do we need to emit rinfo?
                            this.emit("message", msg.data, rinfo);
                        }
                        break;
                }
            }
        };
        Socket.prototype.udp_onClose = function () {
            // we no longer want to receive events
            this.udp.removeAllListeners();
            if (!this._isClosed) {
                this._isClosed = true;
                this.emit("close");
            }
        };
        Socket.prototype.udp_onError = function (exception) {
            this.killConnection(exception);
        };
        /** Kills the underlying UDP connection and emits an error if neccessary */
        Socket.prototype.killConnection = function (err) {
            if (this._isClosed)
                return;
            this._isClosed = true;
            if (this._connectionTimeout != null)
                clearTimeout(this._connectionTimeout);
            if (this.udp != null) {
                // keep the error handler around or we get spurious ENOTFOUND errors unhandled
                this.udp.removeAllListeners("listening");
                this.udp.removeAllListeners("message");
                this.udp.removeAllListeners("close");
                this.udp.close();
            }
            if (err != null)
                this.emit("error", err);
        };
        return Socket;
    }(EventEmitter));
    dtls.Socket = Socket;
    /**
     * Checks if a given object adheres to the Options interface definition
     * Throws if it doesn't.
     */
    function checkOptions(opts) {
        if (opts == null)
            throw new Error("No connection options were given!");
        if (opts.type !== "udp4" && opts.type !== "udp6")
            throw new Error("The connection options must have a \"type\" property with value \"udp4\" or \"udp6\"!");
        if (typeof opts.address !== "string" || opts.address.length === 0)
            throw new Error("The connection options must contain the remote address as a string!");
        if (typeof opts.port !== "number" || opts.port < 1 || opts.port > 65535)
            throw new Error("The connection options must contain a remote port from 1 to 65535!");
        if (typeof opts.psk !== "object")
            throw new Error("The connection options must contain a PSK dictionary object!");
    }
})(dtls || (dtls = {}));
