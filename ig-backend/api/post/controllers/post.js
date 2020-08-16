'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {parseMultipartData, sanitizeEntity} = require('strapi-utils');

module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const {data, files} = parseMultipartData(ctx);
      console.log(data);
      console.log(files);
      if (!files || !files.image) ctx.throw(400, 'Picture is required');
      if (!data || !data.description) ctx.throw(400, 'Data is required');
      const {user: author} = ctx.state; // user is always available in ctx.state => renaming it to author because thats what its called in posts
      entity = await strapi.services.post.create({...data, likes: 0, author}, {files});
    } else {
      ctx.throw(400, 'Picture is required');
    }
    return sanitizeEntity(entity, {model: strapi.models.post});
  },
  async update(ctx) {
    const {id} = ctx.params;
    const {user: author} = ctx.state;

    let entity;
    if (ctx.is('multipart')) {
      ctx.throw(400, 'Picture cannot be changed');
    } else {
      delete ctx.request.body.likes;
      console.log(ctx.request.body);
      entity = await strapi.services.post.update({id, author: author.id}, ctx.request.body); // when author id is supplied only the author may update the object
    }

    return sanitizeEntity(entity, {model: strapi.models.post});
  },
  async delete(ctx) {
    const {id} = ctx.params;
    const {user: author} = ctx.state;

    const entity = await strapi.services.post.delete({id, author: author.id});
    return sanitizeEntity(entity, {model: strapi.models.post});
  },
};
