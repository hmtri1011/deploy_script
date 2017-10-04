#!/usr/bin/env node
const cmd = require('node-cmd')
const co = require('co')
const prompt = require('co-prompt')

// git push
//                   eb deploy

const deployment = ebEnv => {
  return co(function*() {
    var mess = yield prompt('Enter your commit message: ')
    cmd.get(
      `eb use ${ebEnv}
      git pull
      yarn build
      `,
      function(err, data, stderr) {
        if (!err) {
          cmd.run(`NODE_ENV=staging yarn start`)
          console.log('Please check on localhost:3000 before deploy')
          const confirm = new Promise(resolve =>
            resolve(prompt('Do you want to deploy now (y/n): '))
          )

          confirm.then(confirmData => {
            co(function*() {
              const ok = yield confirmData
              if (ok.toLowerCase() === 'y' || ok.toLowerCase() === 'yes') {
                cmd.get(
                  `git add dist -f
                  git commit -m '${mess}'
                  eb status`,
                  (err, data, stderr) => {
                    if (!err) {
                      console.log(data, '\n')
                      console.log('Deployed')
                      process.exit()
                    } else {
                      console.log(err)
                      process.exit()
                    }
                  }
                )
              } else {
                console.log('You dont want to deploy, see yaa!')
                process.exit()
              }
            })
          })
        } else {
          console.log('error', err)
          process.exit()
        }
      }
    )
  })
}

co(function*() {
  var branch = yield prompt(
    'Please choose your enviroment for deploying\n1: Production \t\t 2: Staging\nYour anwser: '
  )
  if (branch === 1 || branch === '1') {
    cmd.get(
      `git checkout master
      git pull`,
      (err, data, stderr) => {
        if (!err) {
          console.log(data)
          return deployment('foxplus-production')
        }
        console.log(err)
        process.exit()
      }
    )
  } else {
    cmd.get(
      `git checkout develop
      git pull`,
      (err, data, stderr) => {
        if (!err) {
          console.log(data)
          return deployment('foxplus-staging')
        }
        console.log(err)
        process.exit()
      }
    )
  }
})
