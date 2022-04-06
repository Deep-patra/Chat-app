const { Router } = require('express');


const logoutRouter = Router();

logoutRouter.route('/logout')
  .get(async (req, res) => {
    try {
      req.session.destroy((err) => {
        console.log(err);
      });

      res.status(200);
    } catch (error) {
      res.status(400).json({ error }).end();
    }
});

module.exports = logoutRouter;