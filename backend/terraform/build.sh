#!/bin/bash
cd ..
zip -r terraform/lambda-create.zip handlers/create.js utils/
zip -r terraform/lambda-login.zip handlers/login.js utils/
zip -r terraform/lambda-logout.zip handlers/logout.js utils/
zip -r terraform/lambda-getUser.zip handlers/getUser.js utils/
zip -r terraform/lambda-updateUser.zip handlers/updateUser.js utils/
echo "✅ Lambda packages created"
