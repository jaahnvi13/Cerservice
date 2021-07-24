module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error','You must be logged in first!');
        return res.redirect('/');
    }
    next();
}

 module.exports.notAccessible=(req,res,next)=>{
     if(req.user.role=='Customer'){
         return res.redirect('/out');
     }
     next();
 }