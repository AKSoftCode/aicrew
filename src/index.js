'use strict';

// Programmatic API (used when aicrew is required as a library)
const installer = require('./installer');
const agentKit  = require('./agent-kit');
const cursorPlugin = require('./cursor-plugin');

module.exports = { installer, agentKit, cursorPlugin };
