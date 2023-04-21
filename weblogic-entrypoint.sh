#!/bin/bash

########### SIGTERM handler ############
function _term() {
   echo "SIGTERM received, shutting down the server!"
   ${DOMAIN_HOME}/bin/stopWebLogic.sh
}

########### SIGKILL handler ############
function _kill() {
   echo "SIGKILL received, shutting down the server!"
   kill -9 $childPID
}

# Set SIGTERM handler
trap _term SIGTERM

# Set SIGKILL handler
trap _kill SIGKILL

# Define DOMAIN_HOME
echo "Domain Home is: " $DOMAIN_HOME

# Start Admin Server and tail the logs
${DOMAIN_HOME}/startWebLogic.sh
touch ${DOMAIN_HOME}/servers/${ADMIN_NAME}/logs/${ADMIN_NAME}.log
tail -f ${DOMAIN_HOME}/servers/${ADMIN_NAME}/logs/${ADMIN_NAME}.log

childPID=$!
wait $childPID