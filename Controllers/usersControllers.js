
const users = require("../Models/userSchema")
const moment = require("moment");
const csv = require("fast-csv")
const fs = require("fs")
const BASE_URL = process.env.BASE_URL


exports.userpost = async (req, res) => {
    console.log(req.body)
    const file = req.file.filename;
    const { fname, lname, email, mobile, gender, location, status } = req.body;

    if (!fname || !lname || !email || !mobile || !gender || !location || !status || !file) {
        res.status(401).json("All Inputs is required")
    }

    try {
        const preuser = await users.findOne({ email: email });

        if (preuser) {
            res.status(401).json("This user already exist in our databse")
        } else {

            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

            const userData = new users({
                fname, lname, email, mobile, gender, location, status, profile: file, datecreated
          
            });
            await userData.save();
            res.status(200).json(userData);

            console.log(userData)
        }
    } catch (error) {
        res.status(401).json(error);
        console.log("the register logic is not working")
    }
};



exports.userget = async (req,res) => {

    const search = req.query.search || ""

    const query = {
        fname: { $regex: search, $options: "i" }
    }


try{
    const getdata = await users.find(query)
    console.log("hid thsi is getdta",getdata)
    res.status(200).json(getdata)
}catch(error){
    console.log(error)
}

}



exports.singleuser = async (req,res) => {

     const {id} = req.params

    try {
       const useredit2 = await users.findOne({_id : id})
        res.status(200).json(useredit2)

    } catch (error) {
        res.status(404).json({error : "No data"})
    }

}



exports.useredit = async (req, res) => {
    const { id } = req.params;
    const { fname, lname, email, mobile, gender, location, status, user_profile } = req.body;
    const file = req.file ? req.file.filename : user_profile

    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    try {
        const updateuser = await users.findByIdAndUpdate({_id:id}, {
            fname, lname, email, mobile, gender, location, status, profile: file, dateUpdated
        }, {
            new: true
        });

        await updateuser.save();
        res.status(200).json(updateuser);
    } catch (error) {
        res.status(401).json(error)
    }
}




exports.userstatus = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const userstatusupdate = await users.findByIdAndUpdate({ _id: id }, { status: data }, { new: true });
        res.status(200).json(userstatusupdate)
    } catch (error) {
        res.status(401).json(error)
    }
}



exports.chartdata = async(req,res) => {

    try {
        // Use MongoDB aggregation to group users by day
        const userStats = await users.aggregate([ // Change from User to users
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$datecreated',
                  timezone: 'UTC',
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);
    
        // Format the data for the chart
        const labels = userStats.map((stat) => stat._id);
        const data = userStats.map((stat) => stat.count);
    
        res.json({ labels, data });
      }
    
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }


}


exports.userExport = async (req, res) => {
    try {
        const usersdata = await users.find();

        const csvStream = csv.format({ headers: true });

        if (!fs.existsSync("public/files/export/")) {
            if (!fs.existsSync("public/files")) {
                fs.mkdirSync("public/files/");
            }
            if (!fs.existsSync("public/files/export")) {
                fs.mkdirSync("./public/files/export");
            }
        }

        const writablestream = fs.createWriteStream(
            "public/files/export/users.csv"
        );

        csvStream.pipe(writablestream);

        writablestream.on("finish", function () {
            res.status(200).json({
                downloadUrl: `${BASE_URL}/files/export/users.csv`,
            });
        });
        if (usersdata.length > 0) {
            usersdata.map((user) => {
                csvStream.write({
                    FirstName: user.fname ? user.fname : "-",
                    LastName: user.lname ? user.lname : "-",
                    Email: user.email ? user.email : "-",
                    Phone: user.mobile ? user.mobile : "-",
                    Gender: user.gender ? user.gender : "-",
                    Status: user.status ? user.status : "-",
                    Profile: user.profile ? user.profile : "-",
                    Location: user.location ? user.location : "-",
                    DateCreated: user.datecreated ? user.datecreated : "-",
                    DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
                })
            })
        }
        csvStream.end();
        writablestream.end();


    } catch (error) {
        res.status(401).json({error : "export is not working"})
    }
}















exports.userdelete = async (req, res) => {
    const { id } = req.params;
    try {
        const deletuser = await users.findByIdAndDelete({ _id: id });
        res.status(200).json(deletuser);
    } catch (error) {
        res.status(401).json(error)
    }
}