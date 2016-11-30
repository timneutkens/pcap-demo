#!/bin/bash
. ~/.nvm/nvm.sh
nvm use
sudo nodemon --exec 'babel-node server.js'