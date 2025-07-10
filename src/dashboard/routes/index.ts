const baseUrl = `${process.cwd()}/src/dashboard/views/`;
import express from 'express';
import passport from 'passport';
const router = express.Router();

router.get('/', (req, res) => {
   if(!res.locals.bot.released) return res.render(baseUrl + 'counter.ejs')
   res.render(baseUrl + 'index.ejs');
});

router.get(`/auth/discord/callback`, passport.authenticate(`discord`, { failureRedirect: "/" }), (req, res) => {
   const banned = false // req.user.id
   if (banned) {
     req.session.destroy(() => {
       res.json({ login: false, message: `You have been blocked from the Dashboard.`, logout: true })
       // @ts-ignore
       req.logout();
     });
   } else {
     // Obtiene la URL anterior de la cookie
     const backURL = req.cookies.backURL || '/';
     // Borra la cookie para evitar que se use más de una vez
     res.clearCookie('backURL');
     res.redirect(backURL);
   }
 });

router.get(`/login`, (req, res, next) => {
   // @ts-ignore
   req.session.backURL = req.session.backURL || req.headers.referer || "/";
   // @ts-ignore
   res.cookie('backURL', req.session.backURL);
   next();
 }, passport.authenticate(`discord`, { prompt: `none` })
 );

router.get(['/logoff', '/logout', '/signoff'], (req, res, next) => {
   // @ts-ignore
   req.logout((err) => {
      if (err) {
         return next(err);
      }
      //@ts-ignore
      req.session.destroy((err) => {
         if (err) {
            return next(err);
         }
         res.redirect('/');
      });
   });
});

export default router;
