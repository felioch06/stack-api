#!/bin/bash
### Automation steps ###
# Inside the project PROJECT
cd /home/%PROJECT

# Install Dependencies
npm install --save

# Update PM2
npx pm2 update

# Kill Last Process
npm run pm2:kill

# Run the build Project
npm run start:%ENV