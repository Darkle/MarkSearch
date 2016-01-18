'use strict';

/****
 * Error middlewares
 */
function errorMiddleware(app){
  /****
   * catch 404 and forward to error handler
   */
  app.use((req, res, next) =>{
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })
  /****
   * error handlers
   */
  app.locals.pretty = true
  app.use((err, req, res, next) =>{
    /****
     * errObjectToShow = {} - no stacktraces leaked to user if in production
     */
    var errObjectToShow = {}
    if(app.get('env') === 'development'){
      console.error(err.status)
      console.error(err.message)
      console.error(err)
      errObjectToShow = err
    }
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: errObjectToShow
    })
  })
}

module.exports = errorMiddleware