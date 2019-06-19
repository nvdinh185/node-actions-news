const fs = require('fs');
const mime = require('mime-types');
const systempath = require('path');

const arrObj = require('../../utils/array-object');

const SQLiteDAO = require('../../db/sqlite3/sqlite-dao');

const dbFile = './db/database/news-v1.db';
const db = new SQLiteDAO(dbFile);

class ResourceHandler {

    getMediaFile(req, res) {
        let path = req.pathName
        let params = path.substring('/site-manager/news/get-file/'.length);
        let fileRead = params.replace('/', systempath.sep);
        let contentType;

        if (mime.lookup(fileRead)) contentType = mime.lookup(fileRead);

        fs.readFile(fileRead, { flag: 'r' }, (error, data) => {
            if (!error) {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(JSON.stringify(error));
            }
        });
    }

    getNewsList(req, res) {
        //req.user,
        //req.json_data.follows,
        //req.json_data.limit
        //req.json_data.offset
        let users = "";
        if (req.json_data.follows.length > 0) {
            req.json_data.follows.forEach(el => {
                users += (users === "" ? "" : ",") + "'" + el + "'";
            });
        }
        //console.log("users: ", users)
        db.getRsts("select *\
                    from news\
                    where username in ("+ users + ")\
                    order by time desc\
                    LIMIT "+ (req.json_data && req.json_data.limit ? req.json_data.limit : 6) + "\
                    OFFSET "+ (req.json_data && req.json_data.offset ? req.json_data.offset : 0) + "\
                    ")
            .then(results => {
                //lay file chi tiet tra cho nhom
                let detailsPromise = new Promise((resolve, reject) => {
                    if (!results || results.length === 0) {
                        resolve();
                    } else {
                        let countDetails = 0;
                        for (let idx = 0; idx < results.length; idx++) {
                            db.getRsts("select *\
                                from news_files\
                                where group_id = '"+ results[idx].group_id + "'\
                                ")
                                .then(files => {
                                    countDetails++;
                                    results[idx].medias = files;
                                    if (countDetails == results.length) {
                                        resolve();
                                    };
                                })
                                .catch(err => reject(err))
                        }
                    }
                })
                detailsPromise.then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(results
                        , (key, value) => {
                            if (value === null) { return undefined; }
                            return value
                        }
                    ));
                })
                    .catch(err => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(JSON.stringify(err));
                    })
            }).catch(err => {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(JSON.stringify(err));
            })
    }

    postNewsFiles(req, res) {
        //console.log('Du lieu truyen', req.form_data);
        let filesDetails = [];
        if (req.form_data.files) {
            for (let key in req.form_data.files) {
                filesDetails.push({
                    type: (key.indexOf('image') >= 0 ? 1 : 0), //chuyen anh hoac file don thuan
                    url: req.form_data.files[key].url,
                    content: req.form_data.files[key].options ? req.form_data.files[key].options.alt : "",
                    options: req.form_data.files[key].options ? req.form_data.files[key].options : {},
                    file_name: req.form_data.files[key].options ? req.form_data.files[key].options.origin : req.form_data.files[key].file_name,
                    file_size: req.form_data.files[key].file_size,
                    file_type: req.form_data.files[key].file_type,
                    file_date: req.form_data.files[key].options ? req.form_data.files[key].options.file_date : Date.now()
                })
            }
        }
        let groupId = Date.now();
        if (req.form_data.params) {
            new Promise(async (resolve, reject) => {
                let jsonObj = {
                    group_id: groupId,
                    content: req.form_data.params.content,
                    details: JSON.stringify(filesDetails),
                    results: JSON.stringify({ likes: {}, comments: {}, shares: {}, reads: {} }),
                    actions: JSON.stringify({ like: true, comment: true, share: true }),
                    username: "766777123",
                    time: Date.now()
                }
                try {
                    let resultInsert = await db.insert(arrObj.convertSqlFromJson("news", jsonObj, []));
                    resolve(resultInsert)
                } catch (e) {
                    reject(e);
                }
            })
                .then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: data }));
                })
                .catch(err => {
                    res.writeHead(438, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        error: err,
                        message: "Lỗi ghi mới dữ liệu"
                    }));
                })
        }
    }
}

module.exports = {
    ResourceHandler: new ResourceHandler()
};