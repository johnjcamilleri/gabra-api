/* globals describe beforeEach it */

var request = require('supertest')
var querystring = require('querystring')
var should = require('should')
var config = require('../server-config.js')

/* Tests for all CRUD editing functionality
   For Should.js syntax see http://shouldjs.github.io/
*/
describe('CRUD', function () {
  const server = require('../app')

  describe('Authentication', function () {
    const path = '/lexemes'

    it('no credentials', function (done) {
      request(server)
        .post(path)
        .send({})
        .expect(401, done)
    })

    it('wrong credentials', function (done) {
      request(server)
        .post(path)
        .auth('wrong', 'password')
        .send({})
        .expect(401, done)
    })

  })

  // -------------------------------------------------------------------------

  describe('Lexemes', function () {
    const path = '/lexemes'
    let doc = {lemma : 'ijfp9e48fp4w90j'}
    let doc2 = {lemma : '9e8fjk94fk09dk'}
    var id = null // ID of created test record, from create

    it('create lexeme', function (done) {
      request(server)
        .post(path)
        .auth(config.test.username, config.test.password)
        .send(doc)
        .expect(function (res) {
          id = res.body._id
          delete res.body._id
        })
        .expect(200, doc, done)
    })

    it('read lexeme', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .get(`${path}/${id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err
          }
          res.body.lemma.should.equal(doc.lemma)
          done()
        })
    })

    it('update lexeme', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .post(`${path}/${id}`)
        .auth(config.test.username, config.test.password)
        .send(doc2)
        .expect(function (res) {
          delete res.body._id
        })
        .expect(200, doc2, done)
    })

    it('delete lexeme', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .delete(`${path}/${id}`)
        .auth(config.test.username, config.test.password)
        .expect(200, done)
    })

  })

  // -------------------------------------------------------------------------

  describe('Wordforms', function () {
    const path = '/wordforms'
    let lexeme_id = '5cbf5064565ea44922694759'
    let doc = {surface_form: 'ijfp9e48fp4w90j', lexeme_id: lexeme_id}
    let doc2 = {surface_form: '9e8fjk94fk09dk', lexeme_id: lexeme_id}
    var id = null // ID of created test record, from create

    it('create wordform', function (done) {
      request(server)
        .post(path)
        .auth(config.test.username, config.test.password)
        .send(doc)
        .expect(function (res) {
          id = res.body._id
          delete res.body._id
        })
        .expect(200, doc, done)
    })

    it('read wordform', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .get(`${path}/${id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err
          }
          res.body.surface_form.should.equal(doc.surface_form)
          done()
        })
    })

    it('update wordform', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .post(`${path}/${id}`)
        .auth(config.test.username, config.test.password)
        .send(doc2)
        .expect(function (res) {
          delete res.body._id
        })
        .expect(200, doc2, done)
    })

    it('delete wordform', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .delete(`${path}/${id}`)
        .auth(config.test.username, config.test.password)
        .expect(200, done)
    })

  })

  // -------------------------------------------------------------------------

  describe('Roots', function () {
    const path = '/roots'
    let doc = {radicals: 'ijfp9e48fp4w90j'}
    let doc2 = {radicals: '9e8fjk94fk09dk'}
    var id = null // ID of created test record, from create

    it('create root', function (done) {
      request(server)
        .post(path)
        .auth(config.test.username, config.test.password)
        .send(doc)
        .expect(function (res) {
          id = res.body._id
          delete res.body._id
        })
        .expect(200, doc, done)
    })

    it('read root', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .get(`${path}/${id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err
          }
          res.body.radicals.should.equal(doc.radicals)
          done()
        })
    })

    it('update root', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .post(`${path}/${id}`)
        .auth(config.test.username, config.test.password)
        .send(doc2)
        .expect(function (res) {
          delete res.body._id
        })
        .expect(200, doc2, done)
    })

    it('delete root', function (done) {
      if (!id) {
        this.skip()
      }
      request(server)
        .delete(`${path}/${id}`)
        .auth(config.test.username, config.test.password)
        .expect(200, done)
    })

  })

})