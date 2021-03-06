/* globals describe it */

var request = require('supertest')
require('should')

/* Tests for feedback functionality */
describe('Feedback', function () {
  const server = require('../app')

  describe('Suggest', function () {
    const path = '/feedback/suggest'

    it('XSS', function (done) {
      request(server)
        .post(path)
        .send({xss: '<script>alert("xss")</script>'})
        .expect(400, done)
    })

    it('existing entry', function (done) {
      request(server)
        .post(path)
        .send({ lemma: 'ħareġ', pos: 'VERB' })
        .expect(200, done)
    })

    it('new entry', function (done) {
      request(server)
        .post(path)
        .send({ lemma: `test-${Date.now()}`, pos: 'VERB' })
        .expect(201, done)
    })
  })
})
