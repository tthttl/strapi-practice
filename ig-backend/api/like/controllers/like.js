'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {parseMultipartData, sanitizeEntity} = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    const {user} = ctx.state;
    const {post: postId} = ctx.request.body;
    let entity;
    if (ctx.is('multipart')) {
      ctx.throw(400, 'No multipart data allowed')
    } else {
      if (typeof postId !== 'number') {
        ctx.throw(400, 'Only number is allowed for postId');
      }
      const postEntity = await strapi.services.post.findOne({id: postId});
      // Check if post exists.
      if (!postEntity) {
        ctx.throw(404, 'Post not found');
      }
      // Check if post has been liked by the same user
      const existingLike = await strapi.services.like.findOne({ // Findhoz eleg az id => QUERY; Querying is done by supplying a query object
        user: user.id,
        post: postEntity.id
      });
      if (existingLike) {
        ctx.throw(400, 'You can only like the same post once');
      } else {
        // Create new like
        entity = await strapi.services.like.create({user, post: postEntity}); // Createhez id nem eleg, full entityk kellenek
        // Update likes counter in post
        await strapi.services.post.update({ // First param => find object, Second param => what to update
          id: postEntity.id
        }, {
          likes: postEntity.likes + 1
        })
      }
    }
    return sanitizeEntity(entity, {model: strapi.models.like});
  },
  async delete(ctx) {
    const {user} = ctx.state; // destructuring, you only take the user field from the state
    const {postId} = ctx.params; // ctx.params ist the way to access URL params => it was changed in routes to :postId (QUERY params ?param=123 is accessed by ctx.request.query.param)
    const postIdAsNumber = parseInt(postId); //now we have to parse because it did not arrive in body but as a query string

    if (typeof postIdAsNumber !== 'number') {
      ctx.throw(400, 'PostId can only be number');
    }

    const deletedEntityArray = await strapi.services.like.delete({ // delete returns an array
      user: user.id,
      post: postIdAsNumber
    });

    if (deletedEntityArray.length) {
      await strapi.services.post.update({
        id: postIdAsNumber
      }, {
        likes: deletedEntityArray[0].post.likes - 1 // deletedLike contains the post
      });

      return sanitizeEntity(deletedEntityArray[0], {model: strapi.models.like}); // delete method also returns the deleted entity
    }

  }
};
