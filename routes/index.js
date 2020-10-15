let express = require("express");
let router = express.Router();
let config = require("../config");
var unirest = require("unirest");
let mongoose = require("mongoose");
let User = require("../models/User.js");
let Group = require("../models/Group.js");
let Link = require("../models/Link.js");
const multer = require("multer");
let Applicant = require("../models/Applicant.js");
const swig = require("swig");
// const nodeZillow = require('node-zillow');
// const zillow = new nodeZillow(config.zillow_api);
const sgMail = require("@sendgrid/mail");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mv = require("mv");
const jwt = require("express-jwt");
const formidable = require("formidable");
const NeptuneFlood = require("../controllers/neptune_flood");
const HavenLife = require("../controllers/haven_life");
const StillWater = require("../controllers/stillwater");
const Universal = require("../controllers/universal");
const Plymouth = require("../controllers/plymouth");
const CommonHelper = require("../helpers/common-helper");
const commonHelper = new CommonHelper();
const passport = require("passport");
const auth = jwt({
    secret: config.secret,
    userProperty: "payload",
});
swig.setDefaults({
    loader: swig.loaders.fs(path.join(__dirname, "../config/templates")),
});

const DIR = "./uploads";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });
let ObjectId = require("mongodb").ObjectId;
sgMail.setApiKey(config.sendgrid);
router.post("/get_plymouth", async function (req, res, next) {
    const plymouth = new Plymouth();
    const data = await plymouth.getPricing(req.body);
    console.log('get_plymouth');
    res.json(data);
});
router.post("/get_universal", async function (req, res, next) {
    const universal = new Universal();
    const data = await universal.getPricing(req.body);
    console.log('get_universal');
    res.json(data);
});
router.post("/get_stillwater", async function (req, res, next) {
    const stillwater = new StillWater();
    const data = await stillwater.getPricing(req.body);
    console.log('get_stillwater');
    res.json(data);
});

router.post("/get_neptuneflood", async function (req, res, next) {
    const neptune = new NeptuneFlood();
    neptune
        .createQuote(req.body)
        .then((data) => res.json(data))
        .catch((data) => { 
            console.log(data);
            res.send(data)
        });
});
router.post("/get_havenlife", async function (req, res, next) {
    const havenLife = new HavenLife();
    const data = await havenLife.generateToken(req.body);
    console.log('get_havenlife');
    res.send(data);
});

/* GET ALL Zillow data*/
/* Now replaced with realtor api*/
router.post("/get_zillow", async (req, response, next) => {
    let { address, citystatezip } = req.body;

    if (address) {
        var req = unirest("GET", config.RealtorConfig.endpoint.location_lookup);

        req.query({
            input: address + "," + citystatezip,
        });

        req.headers(setRapidApiHeader());

        await req.end(async function (res) {
            if (res.error) throw new Error(res.error);
            const { mpr_id } = (res.body.autocomplete && res.body.autocomplete[0]) || null;
            return getPropertyInfo(mpr_id)
                .then((val) => {
                    console.log('this is apllicationda ate:');
                    response.send(val);
                })
                .catch(() => {
                    response.send(null);
                });
        });
    } else {
        response.send(null);
    }
});

router.post("/register", function (req, res, next) {
    let { name, email, phone, link, label, password, mode, _id, profilePic, loginId, isChangePwd, curPwd } = req.body;
    User.find({ email: email }, function (err, user) {
        if (err) {
            res.render("error");
        } else {
            if (mode == 0) {
                if (user.length > 0) {
                    res.send({ status: "error", msg: "Same user already exists." });
                } else {
                    let user = new User();
                    if (req.body.email == config.adminEmail) {
                        user.is_admin = true;
                    }
                    user.name = name;
                    user.email = email;
                    user.phone = phone;
                    user.link = link;
                    user.profilePic = profilePic;
                    user.label = label;
                    user.setPassword(password);
                    user.save(function (err) {
                        let token;
                        token = user.generateJwt();
                        res.status(200);
                        res.json({
                            token: token,
                            status: "success",
                            msg: "Successfully saved.",
                        });
                    });
                }
            } else if (mode == 1) {
                let userid = new ObjectId(_id);
                User.find({ _id: userid }, function (err, user) {
                    if (err) {
                        res.render("error");
                    } else {
                        if (!isChangePwd) {
                            user[0].name = name;
                            user[0].email = email;
                            user[0].label = label;
                            user[0].phone = phone;
                            if (profilePic != "" && profilePic != undefined) {
                                if (user[0].profilePic != "" && user[0].profilePic != undefined) {
                                    try {
                                        fs.unlinkSync(DIR + "/" + user[0].profilePic);
                                    } catch (e) {
                                        console.log(e);
                                    }
                                }
                                user[0].profilePic = profilePic;
                            }
                            if (link != "" && link != undefined) {
                                user[0].link = link;
                            }
                        } else {
                            if (user[0].validPassword(curPwd)) {
                                if (password != "" && password != undefined) {
                                    user[0].setPassword(password);
                                }
                            } else {
                                res.send({ status: "error", msg: "Current Password is incorrect." });
                                return;
                            }
                        }
                        user[0].save(function (err) {
                            if (err) {
                                res.send({ status: "err", msg: "An error occured. Please try again later." });
                                return;
                            }
                            let data = {
                                status: "success",
                                msg: "Successfully updated.",
                            };
                            res.status(200);
                            if (_id == loginId) {
                                let token;
                                token = user[0].generateJwt();
                                data["token"] = token;
                            }
                            res.json(data);
                        });
                    }
                });
            }
        }
    });
});
router.post("/add_group", function (req, res, next) {
    let { name, value, user_id, _id, mode } = req.body;
    Group.find({ name: name, user_id: user_id }, function (err, group) {
        if (err) {
            res.render("error");
        } else {
            if (mode == 0) {
                if (group.length > 0) {
                    res.send({ status: "error", msg: "Same group already exists." });
                } else {
                    let group = new Group();
                    group.name = name;
                    group.value = value;
                    group.user_id = user_id;
                    group.save();
                    res.send({ status: "success", msg: "Successfully Saved." });
                }
            } else if (mode == 1) {
                let groupid = new ObjectId(_id);
                Group.find({ _id: _id }, function (err, group) {
                    if (err) {
                        res.render("error");
                    } else {
                        group[0].name = name;
                        group[0].value = value;
                        group[0].user_id = user_id;
                        group[0].save(function (err) {
                            if (err) {
                                res.send({ status: "err", msg: "An error occurred. Please try again later." });
                                return;
                            }
                            let data = {
                                status: "success",
                                msg: "Successfully updated.",
                            };
                            res.send(data);
                        });
                    }
                });
            }
        }
    });
});
router.post("/delete_group", function (req, res, next) {
    let { id } = req.body;
    Group.remove({ _id: ObjectId(id) }, function (err, group) {
        if (err) {
            res.render("error");
            return;
        } else {
            if (group["ok"] > 0) {
                res.send({ status: "success", msg: "Successfully deleted." });
            }
        }
    });
});
router.post("/get_groups", function (req, res, next) {
    let { user_id } = req.body;
    Group.find({ user_id: user_id }, function (error, group) {
        if (error) {
            res.send({ status: "error", msg: "An error occurred." });
        } else {
            res.send({ status: "success", msg: "successfully saved", data: group });
        }
    });
});
router.post("/upload-logo", upload.single("logo"), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false,
        });
    } else {
        console.log("file received");
        return res.send({
            success: true,
            name: req.file.filename,
        });
    }
});
router.post("/upload-doc", upload.single("doc"), function (req, res) {
    const previousFile = req.body.prevFile;
    if (!req.file) {
        return res.send({
            success: false,
        });
    } else {
        if (previousFile) {
            const filePath = DIR + "/" + previousFile;
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        return res.send({
            success: true,
            name: req.file.filename,
        });
    }
});
router.post("/add_link", function (req, res, next) {
    let { name, label, mode, _id } = req.body;

    Link.find({ name: name }, function (error, link) {
        if (error) {
            res.send({ status: "error", msg: "failed" });
        } else {
            if (link.length > 0) {
                if (link[0]["_id"] == _id && _id != undefined) {
                    saveFunc();
                } else {
                    res.send({ status: "error", msg: "Same data already exists." });
                }
            } else {
                saveFunc();
            }
        }
    });

    function saveFunc() {
        if (_id == undefined) {
            let link = new Link();
            link.name = name;
            link.label = label;
            link.save();
            res.send({ status: "success", msg: "Successfully saved." });
        } else {
            Link.find({ _id: ObjectId(_id) }, function (error, link) {
                if (error) {
                    res.send({ status: "error", msg: "failed" });
                } else {
                    link[0].name = name;
                    link[0].label = label;
                    link[0].save();
                    res.send({ status: "success", msg: "Successfully saved." });
                }
            });
        }
    }
});
router.get("/check_admin", function (req, res, next) {
    User.find({ is_admin: true }, function (err, user) {
        if (err) {
            res.render("An error occured.");
            return;
        } else {
            if (user.length == 0) {
                res.send({ status: "success", result: false });
            } else {
                res.send({ status: "success", result: true });
            }
        }
    });
});
router.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
        let token;
        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }

        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                token: token,
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);
});
router.post("/get_statistics", async function (req, res, next) {
    let { _id, groupId } = req.body;
    User.find({ _id: ObjectId(_id) }, function (err, user) {
        if (err) {
            res.render("error");
        } else if (user.length > 0) {
            let link;
            if (user[0]["is_admin"]) {
                link = user[0]["link"].split(",");
                runQueries(link, true);
            } else {
                runQueries(user[0]["link"].split(","), false);
                // Group.find({_id: ObjectId(groupId)}, function (error, group) {
                //   console.log(group);
                //   if (error) {
                //     res.render('error');
                //   } else {
                //     runQueries(group[0]['value'].split(','));
                //   }
                // })
            }
        }
    });

    async function runQueries(link, is_admin) {
        let data = [];
        let linkQuery;
        let links;
        if (groupId == -1) {
            if (is_admin) {
                linkQuery = Link.find();
                links = await linkQuery.exec();
                getResult(links);
            } else {
                linkQuery = Link.find({ _id: { $in: link } });
                links = await linkQuery.exec();
                getResult(links);
            }
        } else {
            Group.find({ _id: ObjectId(groupId) }, function (err, group) {
                if (err) {
                    res.send({ status: "An error occured" });
                } else {
                    let linkAry = group[0]["value"].split(",");
                    Link.find({ _id: { $in: linkAry } }, function (error, link) {
                        if (error) {
                            res.send({ status: "error" });
                        } else {
                            getResult(link);
                        }
                    });
                }
            });
        }

        async function getResult(links) {
            let applicantsCondition = [];

            for (let condition of links) {
                applicantsCondition.push(condition["name"]);
            }

            const applicantsQuery = Applicant.distinct("link", { link: { $in: applicantsCondition } });
            const applicants = await applicantsQuery.exec();
            let date = new Date();
            let currentMonth = date.getMonth();
            let currentDate = date.getDate();
            let currentYear = date.getFullYear();
            let dateYTD = new Date(date.getFullYear(), 0, 1);
            let date90 = new Date().setDate(date.getDate() - 90);
            let date30 = new Date().setDate(date.getDate() - 30);
            let date7 = new Date().setDate(date.getDate() - 7);
            let date1 = new Date().setDate(date.getDate() - 1);
            if (applicants.length > 0) {
                await applicants.forEach(async function (applicant, index) {
                    let label = await links.filter(function (elem) {
                        return elem.name == applicant;
                    });

                    label = label.length > 0 ? label[0]["label"] : "";

                    let countQuery = Applicant.count({ link: applicant });
                    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    let firstDate = new Date(dateYTD);
                    let secondDate = new Date();
                    let diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
                    let count = await countQuery.exec();
                    let countYTDQuery = Applicant.count({
                        link: applicant,
                        register_date: { $gte: dateYTD, $lt: new Date() },
                    });
                    let countYTD = await countYTDQuery.exec();
                    let count90Query = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(date90), $lt: new Date() },
                    });
                    let count90 = await count90Query.exec();
                    let count30Query = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(date30), $lt: new Date() },
                    });
                    let count30 = await count30Query.exec();

                    let count7Query = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(date7), $lt: new Date() },
                    });
                    let count7 = await count7Query.exec();
                    let count1Query = Applicant.count({
                        link: applicant,

                        register_date: { $gte: new Date(date1), $lt: new Date() },
                    });
                    let count1 = await count1Query.exec();

                    let cdate = new Date(new Date().setFullYear(currentYear - 1));
                    let countCYTDQuery = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(dateYTD.setFullYear(currentYear - 1)), $lt: cdate },
                    });
                    let countCYTD = await countCYTDQuery.exec();

                    let countC90Query = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(new Date(date90).setFullYear(currentYear - 1)), $lt: cdate },
                    });
                    let countC90 = await countC90Query.exec();
                    let countC30Query = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(new Date(date30).setFullYear(currentYear - 1)), $lt: cdate },
                    });
                    let countC30 = await countC30Query.exec();

                    let countC7Query = Applicant.count({
                        link: applicant,
                        register_date: { $gte: new Date(new Date(date7).setFullYear(currentYear - 1)), $lt: cdate },
                    });
                    let countC7 = await countC7Query.exec();
                    let countC1Query = Applicant.count({
                        link: applicant,

                        register_date: { $gte: new Date(new Date(date1).setFullYear(currentYear - 1)), $lt: cdate },
                    });
                    let countC1 = await countC1Query.exec();

                    data.push({
                        link: applicant,
                        label: label,
                        count: count,
                        countYTD: countYTD,
                        count90: count90,
                        count30: count30,
                        count7: count7,
                        count1: count1,
                        countCYTD: countCYTD,
                        countC90: countC90,
                        countC30: countC30,
                        countC7: countC7,
                        countC1: countC1,
                        diffDays: diffDays,
                    });
                    if (index == applicants.length - 1) {
                        await setTimeout(function () {
                            res.send({ status: "success", data: data });
                        }, 2000);
                    }
                });
            } else {
                res.send({ status: "success", data: [] });
            }
        }
    }
});
router.post("/getDataByID", function (req, res, next) {
    let { id, groupId } = req.body;
    User.find({ _id: ObjectId(id) }, function (err, user) {
        if (err) {
            res.render("error");
        } else if (user.length > 0) {
            if (groupId == "-1") {
                let link = user[0]["link"].split(",");
                runQueries(link);
            } else {
                Group.find({ _id: ObjectId(groupId) }, function (error, group) {
                    if (error) {
                        res.render("error");
                    } else {
                        runQueries(group[0]["value"].split(","));
                    }
                });
            }

            function runQueries(link) {
                let link_query = [];
                Link.find({ _id: { $in: link } }, function (err, link) {
                    if (link != undefined) {
                        for (let item of link) {
                            link_query.push(item["name"]);
                        }
                    }
                    if (user[0]["is_admin"] && groupId == "-1") {
                        Applicant.find(function (err, applicant) {
                            if (err) {
                                res.render("error");
                            } else {
                                res.send({ data: applicant, is_admin: user[0]["is_admin"] });
                            }
                        });
                    } else {
                        Applicant.find({ link: { $in: link_query } }, function (err, applicant) {
                            if (err) {
                                res.render("error");
                            } else {
                                res.send({ data: applicant, is_admin: user[0]["is_admin"] });
                            }
                        });
                    }
                });
            }
        } else {
            res.send({ data: [], is_admin: false });
        }
    });
});
router.post("/getUserByID", function (req, res, next) {
    let { id } = req.body;
    User.find({ email: id }, function (err, user) {
        if (err) {
            res.render("error");
            return;
        } else {
            res.send(user);
        }
    });
});
router.post("/getLinkByID", function (req, res, next) {
    let { id } = req.body;
    Link.find({ _id: ObjectId(id) }, function (err, user) {
        if (err) {
            res.render("error");
            return;
        } else {
            res.send(user);
        }
    });
});
router.post("/delete_user", function (req, res, next) {
    let { id } = req.body;
    User.remove({ email: id }, function (err, user) {
        if (err) {
            res.render("error");
            return;
        } else {
            if (user["ok"] > 0) {
                res.send({ status: "success", msg: "Successfully deleted." });
            }
        }
    });
});
router.post("/delete_link", function (req, res, next) {
    let { id } = req.body;
    Link.remove({ _id: ObjectId(id) }, function (err, link) {
        if (err) {
            res.render("error");
            return;
        } else {
            if (link["ok"] > 0) {
                res.send({ status: "success", msg: "Successfully deleted." });
            }
        }
    });
});
router.post("/send_message", function (req, res, next) {
    let senderName = req.body.contactFormName;
    let senderEmail = req.body.contactFormEmail;
    let messageText = req.body.contactFormMessage;
    let emailHeader = commonHelper.getEmailCommonPart()["header"];
    let emailFooter = commonHelper.getEmailCommonPart()["footer"];
    let html = emailHeader;
    html +=
        '               <tr mc:repeatable="item">\n' +
        '                      <td style="padding:0 0 10px;">\n' +
        '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
        "                          <tr>\n" +
        '                            <td mc:edit="block_27" valign="top"\n' +
        '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
        '                              <b style="margin-left:10px;">Name :</b> <span style="float: right;">' +
        senderName +
        "</span>\n" +
        "                            </td>\n" +
        '                            <td mc:edit="block_27" valign="top"\n' +
        '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;width: 31%;">\n' +
        "                            </td>\n" +
        "                          </tr>\n" +
        "                        </table>\n" +
        "                      </td>\n" +
        "                    </tr>\n" +
        '                    <tr mc:repeatable="item">\n' +
        '                      <td style="padding:0 0 10px;">\n' +
        '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
        "                          <tr>\n" +
        '                            <td mc:edit="block_27" valign="top"\n' +
        '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
        '                              <b style="margin-left:10px;">Message:</b> <span style="float: right;">' +
        messageText +
        "</span>\n" +
        "                            </td>\n" +
        "                          </tr>\n" +
        "                        </table>\n" +
        "                      </td>\n" +
        "                    </tr>\n";
    html += emailFooter;
    let subject = "Email from applicant";
    const msg = {
        // from: config.agent_mail,
        // to: config.life_mail,
        to: "solutionweb79@gmail.com",
        from: senderEmail,
        subject: subject,
        html: html,
    };
    sgMail.send(msg);
    res.contentType("json");
    res.send(JSON.stringify({ result: "success" }));
});
router.get("/agent", auth, function (req, res) {
    // If no user ID exists in the JWT return a 401
    if (!req.payload._id) {
        res.status(401).json({
            message: "UnauthorizedError: private profile",
        });
    } else {
        // Otherwise continue
        User.findById(req.payload._id).exec(function (err, user) {
            res.status(200).json(user);
        });
    }
});
router.get("/get_all_users", function (req, res, next) {
    User.find({ is_admin: false }, function (err, user) {
        if (err) {
            res.render({ status: "error", msg: "An error occured." });
        } else {
            res.send(user);
        }
    });
});
router.get("/get_all_links", function (req, res, next) {
    Link.find(function (err, link) {
        if (err) {
            res.render({ status: "error", msg: "An error occured." });
        } else {
            res.send(link);
        }
    });
});
router.post("/send_more_email", function (req, res, next) {
    let { address, persons, type, agent, basicPrice, goodPrice, enhancedPrice } = req.body;
    persons = JSON.parse(persons);
    let subject1 = config.agentsInfo[agent["email"]]["name"] + " **NQR* - " + address.split(",")[0] + " - " + (persons[0]["first_name"] + " " + persons[0]["last_name"]);
    let html = commonHelper.getEmailCommonPart()["header"];
    html +=
        "<tr>\n" +
        '     <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
        '       <h3 style="color: #3d3d3d;text-align: center">Client is looking for the insurances: ' +
        " </td>\n" +
        "   </tr>";
    html +=
        '<tr mc:repeatable="item">\n' +
        '       <td style="padding:0 0 10px;">\n' +
        '           <table width="100%" cellpadding="0" cellspacing="0">\n' +
        '             <tr style="background-color: #3d3d3d; color: white">\n' +
        '               <td mc:edit="block_27" valign="top"\n' +
        '                 style="font:14px/24px Verdana, Geneva, sans-serif; color:#fff;">\n' +
        '                   <b style="margin-left:10px;">Basic Plan:</b> ' +
        basicPrice +
        "\n" +
        "               </td>\n" +
        "             </tr>\n" +
        "           </table>\n" +
        "        </td>\n" +
        "      </tr>\n" +
        '<tr mc:repeatable="item">\n' +
        '       <td style="padding:0 0 10px;">\n' +
        '           <table width="100%" cellpadding="0" cellspacing="0">\n' +
        '             <tr style="background-color: #3d3d3d; color: white">\n' +
        '               <td mc:edit="block_27" valign="top"\n' +
        '                 style="font:14px/24px Verdana, Geneva, sans-serif; color:#fff;">\n' +
        '                   <b style="margin-left:10px;">Good Plan:</b> ' +
        goodPrice +
        "\n" +
        "               </td>\n" +
        "             </tr>\n" +
        "           </table>\n" +
        "        </td>\n" +
        "      </tr>\n" +
        '<tr mc:repeatable="item">\n' +
        '       <td style="padding:0 0 10px;">\n' +
        '           <table width="100%" cellpadding="0" cellspacing="0">\n' +
        '             <tr style="background-color: #3d3d3d; color: white">\n' +
        '               <td mc:edit="block_27" valign="top"\n' +
        '                 style="font:14px/24px Verdana, Geneva, sans-serif; color:#fff;">\n' +
        '                   <b style="margin-left:10px;">Enhanced Plan:</b> ' +
        enhancedPrice +
        "\n" +
        "               </td>\n" +
        "             </tr>\n" +
        "           </table>\n" +
        "        </td>\n" +
        "      </tr>\n";
    html += commonHelper.getEmailCommonPart()["footer"];
    const msg1 = {
        // to: config.agent_mail
        to: config.agentsInfo[agent["email"]]["email"],
        from: config.from,
        subject: subject1,
        html: html,
    };
    sgMail.send(msg1).then((res) => {
        console.log(res);
    });
    res.contentType("json");
    res.send(JSON.stringify({ result: "success" }));
});
router.post("/send_life_email", function (req, res, next) {
    let total_data = req.body;
    const persons = total_data.personData;
    let address;
    if (total_data.addressData) {
        address = total_data.GooglePlace ? total_data.addressData.address + ", " + total_data.addressData.locality + ", " + total_data.addressData.administrative_area_level_1 : total_data.staticAddress;
    } else {
        address = total_data.address_data.formatted_address;
    }
    Applicant.find({ quote_id: total_data.quote_id }, function (err, applicant) {
        if (err) {
            res.render("error");
            return;
        }
        if (applicant.length == 0) {
            let applicant = new Applicant();
            applicant.name = persons[0]["first_name"] + " " + persons[0]["last_name"];
            applicant.email = total_data.email;
            applicant.address = address;
            applicant.quote_id = total_data.quote_id;
            applicant.link = total_data.link;
            applicant.save();
        }
    });
    const detailsEmailTemplate = swig.compileFile("details_email.twig");
    const html1 = detailsEmailTemplate(total_data);
    fs.writeFileSync("./detailsEmailTemplate123.html", html1);
    let subject1 = config.agentsInfo[total_data.agent["email"]]["name"] + " **NQR* - " + address.split(",")[0] + " - " + (total_data.personData[0]["first_name"] + " " + total_data.personData[0]["last_name"]);

    let subject2 = "Quote Request Received! - " + address.split(",")[0];
    let agentEmail, agentSubject, agentPhone;
    if (config.agentsInfo[total_data.agent["email"]]) {
        agentEmail = config.agentsInfo[total_data.agent["email"]]["email"];
        agentPhone = config.agentsInfo[total_data.agent["email"]]["phone"];
        agentSubject = config.agentsInfo[total_data.agent["email"]]["name"];
    } else {
        agentEmail = config.agentsInfo["pete"]["email"];
        agentPhone = config.agentsInfo["pete"]["phone"];
        agentSubject = config.agentsInfo["pete"]["name"];
    }
    Object.assign(total_data, { agentEmail });
    Object.assign(total_data, { agentPhone });
    Object.assign(total_data, { agentSubject });
    const thankyouTemplate = swig.compileFile("thankyou.twig");
    const html2 = thankyouTemplate(total_data);
    /*Send the "Thank you email" to user*/
    const msg2 = {
        from: config.from,
        to: total_data.email,
        subject: subject2,
        html: html2,
    };
    sgMail.send(msg2);
    /*Send the "Quote Request email" to agent*/

    const msg4 = {
        from: config.from,
        to: config.peterEmail,
        subject: "MASTER " + subject1,
        html: html1,
    };
    sgMail.send(msg4);

    /*Send the quote email*/
    let to = config.quote_mail;
    const msg1 = {
        from: config.from,
        to: [agentEmail, to],
        subject: subject1,
        html: html1,
    };
    sgMail.sendMultiple(msg1);
    res.contentType("json");
    res.send(JSON.stringify({ result: "success" }));
});
router.post(
    "/send_userdata_to_agent",
    cors({
        origin: true,
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": true,
        "Access-Control-Allow-Headers": true,
        "Access-Control-Expose-Headers": true,
    }),
    function (req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let dir = "../personData";
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            let oldpath = files.attachment.path;
            let newpath = path.dirname(__filename).replace(/\\/g, "/").replace(path.dirname(__filename).split(path.sep).pop(), "personData") + "/" + Date.now() + "_" + files.attachment.name;
            mv(oldpath, newpath, { mkdirp: true }, function (err) {
                if (err) {
                    res.send({ status: "error" });
                } else {
                    let filedata = base64_encode(newpath);
                    let htmlbody =
                        '<table width="100%" cellpadding="0" cellspacing="0">\n' +
                        '                    <tr mc:repeatable="item">\n' +
                        '                      <td style="padding:0 0 27px;">\n' +
                        '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                        "                          <tr>\n" +
                        '                            <td mc:edit="block_26" width="40" valign="top">\n' +
                        '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                        '                                   style="vertical-align:top;" alt=""/>\n' +
                        "                            </td>\n" +
                        '                            <td mc:edit="block_27" valign="top"\n' +
                        '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                        "                              <b>Name:</b> " +
                        fields["username"] +
                        "\n" +
                        "                            </td>\n" +
                        "                          </tr>\n" +
                        "                        </table>\n" +
                        "                      </td>\n" +
                        "                    </tr>\n" +
                        '                    <tr mc:repeatable="item">\n' +
                        '                      <td style="padding:0 0 27px;">\n' +
                        '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                        "                          <tr>\n" +
                        '                            <td mc:edit="block_26" width="40" valign="top">\n' +
                        '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                        '                                   style="vertical-align:top;" alt=""/>\n' +
                        "                            </td>\n" +
                        '                            <td mc:edit="block_27" valign="top"\n' +
                        '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                        "                              <b>Comment:</b> " +
                        fields["comment"] +
                        "\n" +
                        "                            </td>\n" +
                        "                          </tr>\n" +
                        "                        </table>\n" +
                        "                      </td>\n" +
                        "                    </tr>\n" +
                        "                  </table>\n";
                    let htmlContent = commonHelper.getEmailCommonPart()["header"] + htmlbody + commonHelper.getEmailCommonPart()["footer"];
                    fs.readFile(newpath, function (err, data) {
                        sgMail.send({
                            to: "peter.hughes@pinnaclepartnerscorp.com",
                            from: "info@pinnaclepartnerscorp.com",
                            subject: "Job Inquiry from Website :" + fields["jobTitle"],
                            attachments: [
                                {
                                    filename: files.attachment.name,
                                    content: filedata,
                                    type: "application/pdf",
                                    disposition: "attachment",
                                    contentId: "myId",
                                },
                            ],
                            html: htmlContent,
                        });
                    });

                    function base64_encode(file) {
                        let source = fs.readFileSync(file);
                        return new Buffer.from(source).toString("base64");
                    }

                    res.send({ status: "success" });
                }
                res.end();
            });
        });
    }
);

// function that calls property details api accepting the property id and returns the required  object
async function getPropertyInfo(propertyId) {
    return new Promise((resolve) => {
        if (propertyId) {
            var req = unirest("GET", config.RealtorConfig.endpoint.property_details);

            req.query({
                property_id: propertyId,
            });
            req.header = req.headers(setRapidApiHeader());

            req.end(async function (res) {
                if (res.error) {
                    console.log("error");
                    resolve(null);
                }
                console.log("success");
                if (res.body && res.body.properties && res.body.properties.length > 0) {
                    const resp = {
                        year_built: res.body.properties[0].year_built || res.body.properties[0].public_records[0].year_built,
                        price: res.body.properties[0].price,
                        building_size: res.body.properties[0].building_size.size || res.body.properties[0].public_records[0].building_sqft,
                    };
                    resolve(resp);
                }
            });
        } else {
            resolve(null);
        }
    });
}

function setRapidApiHeader() {
    return {
        "x-rapidapi-host": config.RealtorConfig.settings.host,
        "x-rapidapi-key": config.RealtorConfig.settings.key,
        useQueryString: true,
    };
}

module.exports = router;
