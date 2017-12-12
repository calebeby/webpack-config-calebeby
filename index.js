#!/usr/bin/env node

const meow = require('meow')

const cli = meow(`
  Usage
    $ webpack-config-calebeby <input>

  Options
    --rainbow, -r  Include a rainbow

  Examples
    $ webpack-config-calebeby unicorns --rainbow
`)

const watch = !cli.input.includes('build')

const production = watch
  ? cli.flags.production !== undefined
  : cli.flags.development === undefined

if (watch) {
  require('./watch')({ production })
} else {
  require('./build')({ production })
}
