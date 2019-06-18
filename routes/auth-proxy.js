
"use strict"

const router = require('express').Router();

const tokenHandler = require('../utils/token-proxy');
const postHandler = require('../utils/post-handler');

//gui chuoi json nhan duoc len authen server nhan ket qua, tra lai user
router.post('/authorize-token'
            , postHandler.jsonProcess //lay jsonProcess truong hop khong dung interceptor
            , tokenHandler.getToken
            , tokenHandler.verifyProxyToken
            , tokenHandler.authorizeToken
            );

module.exports = router;