#!/usr/bin/env node
const cmd = require('node-cmd')

// change foxplus-production to foxplus-staging if want to deploy staging
cmd.get(
  `eb use foxplus-production
  git pull
  yarn build
  git add dist -f
  git commit -m "Build production"
  git push
  eb deploy`,
  (err, data, stderr) => {
    if (!err) {
      console.log('Deployed!')
    } else {
      console.log('error', err)
    }
  }
)
