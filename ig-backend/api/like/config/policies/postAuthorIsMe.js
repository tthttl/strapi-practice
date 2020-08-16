module.exports = async (ctx, next) => {
  if (!ctx.request.query['post.author']) {
    ctx.throw(401, 'You need to supply the author param');
  }
  const postAuthorId = String(ctx.request.query['post.author']);
  const loggedInUserId = String(ctx.state.user.id);

  if(postAuthorId === loggedInUserId){
    return next();
  } else {
    return ctx.throw(401, 'You are not the author of this post');
  }
}
