// @ts-check
/* global harden */
import '@agoric/zoe/exported.js';
import { Far } from '@endo/far';
import { ICS27ICAProtocol } from './ica.js';

/**
 *
 * @type {ContractStartFn}
 */
const start = () => {
  const creatorFacet = Far('creatorFacet', {
    // The creator of the instance can be called by the creator
  });

  const publicFacet = Far('publicFacet', {
    // Public faucet for anyone to call
    /**
     * @param {import('@agoric/network').Port} port
     * @param {object} connectionHandler
     * @param {string} controllerConnectionId
     * @param {string} hostConnectionId
     */
    createICAAccount: (
      port,
      connectionHandler,
      controllerConnectionId,
      hostConnectionId,
    ) =>
      ICS27ICAProtocol.createICS27Account(
        port,
        connectionHandler,
        controllerConnectionId,
        hostConnectionId,
      ),
    /**
     * 
     * @param {[import('./types.js').Msg]} msgs 
     * @param {import('@agoric/network').Connection} connection 
     */
    sendICATxPacket: (
      msgs,
      connection,
    ) => ICS27ICAProtocol.sendICATx(msgs, connection),
  });

  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
