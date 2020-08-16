module.exports = async (ctx, next) => {
  const targetUserId = String(ctx.request.query.user); // Both have to be converted to strings
  const loggedInUserId = String(ctx.state.user.id);

  if(targetUserId === loggedInUserId){
    return next(); // has to be returned
  } else {
    return ctx.throw(401, 'Target user is not the logged in user');
  }
}
