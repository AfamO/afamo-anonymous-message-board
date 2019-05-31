/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let newestThreadId=null; // To be used to tst delete
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Create a general message thread',function (done) {
        chai.request(server)
            .post('/api/threads/general')
            .send({
              text:"2019 SwearingIn",
              delete_password:"swearing",
                source:"test"
            })
            .end(function (err,res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.text, '2019 SwearingIn');
              assert.isArray(res.body.replies, 'replies must be an array');
              assert.equal(res.body.reported, false);
              assert.property(res.body,'created_on',' created_on must be found in the array');
              assert.property(res.body,'bumped_on','bumped_on must be found in the array');
              newestThreadId=res.body._id;// To be used to tst delete
              done();
            });
      });
    });
    
    suite('GET', function() {
      test('Get the List of Message Threads', function (done) {
        chai.request(server)
            .get('/api/threads/general')
            .query({})
            .end(function (err,res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body,'body must be an array');
              assert.property(res.body[0], 'text','text must be found in the result');
              assert.property(res.body[0],'created_on',' created_on must be found in the result');
              assert.property(res.body[0],'bumped_on','bumped_on must be found in the result');
              assert.isArray(res.body[0].replies, 'replies must be an array');
              assert.property(res.body[0], '_id','_id must be in the array');
              done();
            });
      });
    });
    
    suite('DELETE', function() {
      test('Delete a thread with given Id and delete_Password',function (done) {
        chai.request(server)
            .delete('/api/threads/general')
            .query({
                thread_id:newestThreadId,
                delete_password: 'swearing'})
            .end(function (err,res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.status, 200);
              assert.equal(res.body.msg, 'success');
              done();
            });
      });
    });
    
    suite('PUT', function() {
      test('Report a thread with given thread Id',function (done) {
        chai.request(server)
            .put('/api/threads/general')
            .send({thread_id:'5cee7a084853081cb8ccf76d'})
            .end(function (err,res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.status, 200);
              assert.equal(res.body.msg, 'success');
              done();
            })
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
     let  newestThreadReplyId=null;
    suite('POST', function() {
      test('Post a REPLY  for general message thread',function (done) {
        chai.request(server)
            .post('/api/replies/general')
            .send({
              thread_id:'5cee7a084853081cb8ccf76d',
              text:"Yes, it is democracy day",
              delete_password:"reply",
                source:"test"
            })
            .end(function (err,res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body.replies, 'replies must be an array');
              assert.property(res.body.replies[0],'text', 'text must be a property in the replies array');
              assert.equal(res.body.replies[0].reported, false);
              assert.property(res.body.replies[0], '_id','_id must be a property in the replies array');
              assert.property(res.body.replies[0],'created_on',' created_on must be found in the array');
              assert.equal(res.body.bumped_on,res.body.replies[res.body.replies.length-1].created_on,'bumped_on date must be equal to replies date' );
              newestThreadReplyId=res.body.replies[res.body.replies.length-1]._id;// To be used to test delete
              done();
            });
      });
    });
    suite('GET', function() {
      test('Get ALL the Replies of a thread with given thread_id',function (done) {
        chai.request(server)
            .get('/api/replies/general')
            .query({thread_id:'5cee7a084853081cb8ccf76d'})
            .end(function (err,res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body.replies, 'replies must be an array');
              assert.property(res.body.replies[0], '_id','_id must be a property in the replies array');
              assert.property(res.body.replies[0], 'text','text must be a property');
              assert.property(res.body.replies[0],'created_on',' created_on must be found in the array');
              done();
            });
      });
    });
    
    suite('PUT', function() {
        test('Report a REPLY of general message thread',function (done) {
           // console.log("NewestThreadReplyId=="+newestThreadReplyId);
            chai.request(server)
                .put('/api/replies/general')
                .send({
                    thread_id:'5cee7a084853081cb8ccf76d',
                    reply_id:newestThreadReplyId
                })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, 200);
                    assert.equal(res.body.msg, 'success');
                    done();
                });
        });
    });
    
    suite('DELETE', function() {
        test('Delete a  REPLY of general message thread',function (done) {
            chai.request(server)
                .delete('/api/replies/general')
                .query({
                    thread_id:'5cee7a084853081cb8ccf76d',
                    reply_id:newestThreadReplyId,
                    delete_password: 'reply'
                })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, 200);
                    assert.equal(res.body.msg, 'success');
                    done();
                });
        });
    });
    
  });

});
