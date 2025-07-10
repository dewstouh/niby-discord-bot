const baseUrl = `${process.cwd()}/src/dashboard/views/`;
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
   if(!res.locals.bot.released) return res.redirect("/");
   res.render(baseUrl + "premium.ejs");
});

export default router;
