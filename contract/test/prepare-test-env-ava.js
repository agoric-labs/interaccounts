// @ts-check
/**
 * Like prepare-test-env but also sets up ses-ava and provides
 * the ses-ava `test` function to be used as if it is the ava
 * `test` function.
 */

import '@endo/init/pre-bundle-source.js';
import '@agoric/zoe/tools/prepare-test-env.js';
import rawTest from 'ava';
import { wrapTest } from '@endo/ses-ava';

import { prepareNetworkProtocol, prepareLoopbackProtocolHandler } from '@agoric/network';
import { makeHeapZone } from '@agoric/zone/heap.js';
import { prepareVowTools } from '@agoric/vow';

/** @typedef {Awaited<ReturnType<makeTestContext>>} Context */

/** @typedef {import('ava').ExecutionContext<Context>} ExecutionContext */
export const test = /** @type {import('ava').TestInterface<Context>} */ (/** @type {unknown} */ (wrapTest(rawTest)));

const vowTools = prepareVowTools(makeHeapZone());

/**
 * @param {any} _t
 */
export const makeTestContext = async _t => {
  const zone = makeHeapZone();
  const makeLoopbackProtocolHandler = prepareLoopbackProtocolHandler(zone, vowTools);
  const makeNetworkProtocol = prepareNetworkProtocol(zone, vowTools);

  const protocol = makeNetworkProtocol(makeLoopbackProtocolHandler());

  return { zone, protocol, when: vowTools.when };
};
