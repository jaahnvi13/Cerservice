const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const passport=require('passport');
const LocalStrategy=require('passport-local');

const { carownerSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Carowner = require('./model/carowner');
const Service = require('./model/service');
const User=require('./model/user');
const {isLoggedIn,notAccessible} = require('./middleware');

mongoose.connect('mongodb+srv://jaahnvi:jaahnvi@cluster0.esgyh.mongodb.net/carservice', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.get('/',(req,res)=>{
    res.render('cars/login');
});

app.post('/login',passport.authenticate('local', {failureFlash: true, failureRedirect: '/' }),async(req,res)=>{
    req.flash('success',"Welcome to Samurai Cars!");
    const redirectUrl=req.session.returnTo || '/home';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

app.get('/logout',(req,res)=>{
     req.logout();
     req.flash('success','Successfully logged out!');
     res.redirect('/');
});

app.get('/out',(req,res)=>{
    req.logout();
    req.flash('error','You are not allowed to access that page!');
    res.redirect('/');
})

app.get('/signup',(req,res)=>{
    res.render('cars/signup');
});

app.post('/signup',catchAsync(async(req,res)=>{
    try{
    const {usern,username,contact,emai,password,role} = req.body;
    const user= new User({username,role});
    const registeredUser=await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) return next(err);
        req.flash('success',"Welcome to Samurai Cars!");
        res.redirect('/home');
    })
    } catch (e){
        req.flash('error',e.message);
        res.redirect('signup');
    }
}));

app.get('/home',isLoggedIn,(req, res) => {
    res.render('cars/abcd');
});

app.get('/reg',isLoggedIn,notAccessible, async (req, res) => {
    res.render('cars/register');
});

app.post('/reg',isLoggedIn,notAccessible, catchAsync(async (req, res, next) => {
    const newowner = new Carowner({
        model: req.body.model,
        year: req.body.year,
        vin: req.body.vin,
        kmsdriven: req.body.kmsdriven,
        dop: req.body.dop,
        owner: req.body.owner,
        contact: req.body.contact,
        email: req.body.email,
        address: req.body.address,
        createdOn: req.body.createdOn,
    });
    const vin = req.body.vin;
    Carowner.findOne({vin},async(err,carowner)=>{
        if(err) throw err;
        else if(carowner!=null){
            req.flash('error','VEHICLE IS ALREADY REGISTERED!');
            return res.redirect('/reg');
        }else{
            await newowner.save();
            req.flash('success', 'Succesfully submitted!');
            return res.redirect('/reg');
        }
    })
}));

app.get('/search',isLoggedIn, catchAsync(async (req, res) => {
    res.render('cars/search');
}));

app.post('/search',isLoggedIn, catchAsync(async (req, res) => {
    const vin = req.body.vin;
    const contact=req.body.contact;
    if(contact=="" && vin==""){
        req.flash('error','ONE OF THE FEILDS IS MANDITORY!');
        return res.redirect('/search');
    }
    else if(contact==""){
    Carowner.findOne({vin},(err,carowner) =>{
        if(err) {
           throw err;
        }
        else if(carowner){
            res.render('cars/index',{carowner:carowner,vin:vin,contact:contact});
        }else{
            req.flash('error', 'VEHICLE IS NOT YET REGISTERED!');
            return res.redirect('/search');
        };
    });
    }else{
        Carowner.findOne({contact},(err,carowner) =>{
            if(err) {
               throw err;
            }
            else if(carowner){
                res.render('cars/index',{carowner:carowner,vin:vin,contact:contact});
            }else{
                req.flash('error', 'VEHICLE IS NOT YET REGISTERED!');
                return res.redirect('/search');
            };
        });
    }
}));

app.get('/service',isLoggedIn,notAccessible, catchAsync(async (req, res) => {
    var x=0;
    Service.find({},(err,result)=>{
        if(err) throw err;
        else{
        x=result.length+1;
        res.render('cars/service',{x:x});
    }})
}));

app.post('/service',isLoggedIn,notAccessible, catchAsync(async (req, res, next) => {
    const newservice = new Service({
        sid: req.body.sid,
        stype: req.body.stype,
        sdate: req.body.sdate,
        vin: req.body.vin,
        kmsdriven: req.body.kmsdriven,
        employee: req.body.employee,
        instructions:req.body.instructions
    });
    const vin = req.body.vin;
    const kmsdriven = req.body.kmsdriven;
    Carowner.findOne({vin},async(err,carowner)=>{
        if(err) throw err;
        else if(carowner!=null){
            carowner.kmsdriven=kmsdriven;
            carowner.services= newservice;
            await carowner.save();
            await newservice.save();
            req.flash('success', 'Service Booked Successfully!');
            return res.redirect('/service');
        }else{
            req.flash('error','VEHICLE IS NOT YET REGISTERED!');
            return res.redirect('/service');
        }
    })       
}));

app.get('/report',isLoggedIn,notAccessible, async (req, res) => {
    res.render('cars/report');
});

app.post('/report',isLoggedIn,notAccessible,async(req,res)=>{
    const rep=req.body.rep;
    const today =new Date();
    const date=today.getDate();
    const month=today.getMonth();
    const year=today.getFullYear();
    Carowner.find({},function(err,carowners){
        if(err) throw err;
        else {
        res.render('cars/find',{
            carownerList:carowners,
            rep:rep,
            date:date,
            month:month,
            year:year
        })
    }})
})

app.get('/history',isLoggedIn,notAccessible,async(req,res)=>{
    res.render('cars/history');
})

app.post('/history',isLoggedIn,notAccessible,async(req,res)=>{
  const no=req.body.no;
  Service.find({},(err,services)=>{
      if(err) throw err;
      else{
          var x=services.length;
          var y=1;
          res.render('cars/his',{
              serviceList:services,
              no:no,
              x:x,
              y:y
          });
      }
  })
})

app.get('/abc', catchAsync(async (req, res) => {
    Carowner.find({}, function (err, carowners) {
        res.render('cars/index', {
            carownerList: carowners
        })
    })
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found'), 404);
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})