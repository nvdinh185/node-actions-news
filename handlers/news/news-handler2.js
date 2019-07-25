const arrObj = require('../../utils/array-object');

const SQLiteDAO = require('../../db/sqlite3/sqlite-dao');

const dbFile = './db/database/news-v2.db';
const db = new SQLiteDAO(dbFile);

class ResourceHandler {

    async getNewsList(req, res) {
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
        try {
            let results = await db.getRsts("select *\
                                            from news\
                                            where username in ("+ users + ")\
                                            order by time desc\
                                            LIMIT "+ (req.json_data && req.json_data.limit ? req.json_data.limit : 6) + "\
                                            OFFSET "+ (req.json_data && req.json_data.offset ? req.json_data.offset : 0) + "\
                                            ")
            if (results.length > 0) {
                for (let idx = 0; idx < results.length; idx++) {
                    let files = await db.getRsts("select *\
                                                from results\
                                                where group_id = '"+ results[idx].group_id + "'\
                                                ")
                    results[idx].medias = files[0]
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(results
                , (key, value) => {
                    if (value === null) { return undefined; }
                    return value
                }
            ));
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(JSON.stringify(err));
        }
    }

    async postNewsFiles(req, res) {
        console.log('Du lieu truyen', req.form_data);
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
            let jsonObj = {
                group_id: groupId,
                content: req.form_data.params.content,
                details: JSON.stringify(filesDetails),
                actions: JSON.stringify({ like: true, comment: true, share: true }),
                username: "901952666",
                time: Date.now()
            }
            let jsonObj2 = {
                group_id: groupId,
                likes: JSON.stringify({}),
                comments: JSON.stringify([]),
                shares: JSON.stringify([]),
                reads: JSON.stringify([])
            }
            try {
                let resultInsert = await db.insert(arrObj.convertSqlFromJson("news", jsonObj, []));
                let resultInsert2 = await db.insert(arrObj.convertSqlFromJson("results", jsonObj2, []));

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: resultInsert2 }));
            } catch (err) {
                res.writeHead(438, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    error: err,
                    message: "Lỗi ghi mới dữ liệu"
                }));
            }
        }
    }

    async postActions(req, res) {
        //console.log(req.json_data)
        let sqlInsertGroup = arrObj.convertSqlFromJson(
            "results",
            {
                group_id: req.json_data.group_id
                , likes: JSON.stringify(req.json_data.result)
            }
            , ["group_id"]
        );
        try {
            let data = await db.update(sqlInsertGroup);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data));
        } catch (err) {
            res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err, message: "error insert db" }));
        }
    }
}

module.exports = {
    ResourceHandler: new ResourceHandler()
};