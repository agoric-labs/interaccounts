// @ts-check
import { E, Far } from '@endo/far';
import { assert, details as X } from '@agoric/assert';
import { TxBody } from '@agoric/cosmic-proto/cosmos/tx/v1beta1/tx.js';
import { Any } from '@agoric/cosmic-proto/google/protobuf/any.js';
import { toBase64, fromBase64 } from '@cosmjs/encoding/build/base64.js';
import { when } from '@agoric/vow/vat.js';

/**
 * @import { Msg, ICAProtocol, ICS27ICAPacket } from './types.js';
 * @import { PromiseVow } from '@agoric/vow';
 * @import { ConnectionHandler, Connection, Port, Bytes } from '@agoric/network';
 */

/**
 * Create an ICA account/channel on the connection provided
 *
 * @param {Port} port
 * @param {ConnectionHandler} connectionHandler
 * @param {string} controllerConnectionId
 * @param {string} hostConnectionId
 * @returns {PromiseVow<Connection>}
 */
export const createICAAccount = async (
  port,
  connectionHandler,
  controllerConnectionId,
  hostConnectionId,
) => {
  const connString = JSON.stringify({
    version: 'ics27-1',
    controllerConnectionId,
    hostConnectionId,
    address: '',
    encoding: 'proto3',
    txType: 'sdk_multi_msg',
  });

  const connection = await when(E(port).connect(
    `/ibc-hop/${controllerConnectionId}/ibc-port/icahost/ordered/${connString}`,
    connectionHandler,
  ));

  return connection;
};

/**
 * Provide a connection object and a list of msgs and send them through the ICA channel.
 *
 * @param {[Msg]} msgs
 * @param {Connection} connection
 * @returns {Promise<string>}
 */
export const sendICAPacket = async (msgs, connection) => {
  var allMsgs = []
  // Asserts/checks
  for (let msg of msgs) {
    assert.typeof(
      msg.data,
      'string',
      X`data within object must be a base64 encoded string`,
    );
    assert.typeof(
      msg.typeUrl,
      'string',
      X`typeUrl within object must be a string of the type`,
    );

    // Convert the base64 string into a uint8array
    let valueBytes = fromBase64(msg.data)

    // Generate the msg.
    const txmsg = Any.fromPartial({
      typeUrl: msg.typeUrl,
      value: valueBytes,
    });
    
    // add the new message to all msg array
    allMsgs.push(txmsg)
  }
  const body = TxBody.fromPartial({
    messages: Array.from(allMsgs),
  });

  const buf = TxBody.encode(body).finish();

  // Generate the ics27-1 packet.
  /** @type {ICS27ICAPacket} */
  const ics27 = {
    type: 1,
    data: toBase64(buf),
    memo: '',
  };

    /** @type {Bytes} */
  const packet = JSON.stringify(ics27);

  const res = await when(E(connection).send(packet));

  return res;
};

/** @type {ICAProtocol} */
export const ICS27ICAProtocol = Far('ics27-1 ICA protocol', {
  sendICATx: sendICAPacket,
  createICS27Account: createICAAccount,
});
