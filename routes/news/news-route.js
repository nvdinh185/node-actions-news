const router = require('express').Router();

const postHandler = require('../../utils/post-handler');
const tokenHandler = require('../../utils/token-proxy');

const resourceHandler = require('../../handlers/news/news-handler');

let handlers = resourceHandler.ResourceHandler;


router.post('/post-news'
    , tokenHandler.getTokenNext          //lay req.token
    , tokenHandler.verifyProxyTokenNext  //lay req.user
    , postHandler.formProcess        //lay req.form_data
    , handlers.postNewsFiles        //luu csdl
);
router.post('/get-news'
    , tokenHandler.getTokenNext
    , tokenHandler.verifyProxyTokenNext
    , postHandler.jsonProcess //lay du lieu req.json_data.friends/follows/publics/limit/offset
    , handlers.getNewsList //lay tin tuc tu req.user?, publics, follows, friends,
);
router.post('/post-actions'
    , tokenHandler.getTokenNext        //lay req.token
    , tokenHandler.verifyProxyTokenNext  //lay req.user
    , postHandler.jsonProcess        //lay req.json_data
    , handlers.postActions        //luu csdl
);
router.get('/get-file/*'
    , tokenHandler.getTokenNext
    , tokenHandler.verifyProxyTokenNext
    , handlers.getMediaFile
);

module.exports = router;