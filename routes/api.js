/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var dbApp  = require('../data/DBApp')

module.exports = function (app) {
    app.route('/b/:board/')
        .get(function (req,res) {
            let boardname=req.params.board;
            if(boardname==null)
                res.json({msg:"Missing boardname: The api needs boardname as a parameter",status:500});
            dbApp.queryMessage(boardname,function (err,data) {
                if(err)
                    res.json({msg:"Error getting-retrieving the message thread",status:500});
                res.json(data);
            });
        });
  app.route('/b/:board/:thread_id')
      .get(function (req,res) {
         console.log("I AM HERE");
          let boardname=req.params.board;
          if(boardname==null)
              res.json({msg:"Missing boardname: The api needs boardname as a parameter",status:500});
          dbApp.queryMessage(boardname,function (err,data) {
              if(err)
                  res.json({msg:"Error getting-retrieving the message thread",status:500});
              res.json(data);
          });
      });
  app.route('/api/threads/:board')
      .post(function (req,res) {
         let boardname=req.params.board;
         if(boardname==null)
           res.json({msg:"Missing boardname: The api needs boardname as a parameter",status:500});
         let messageBody= req.body;
         if(messageBody==null)
           res.json({msg:"Missing Body: The api needs parameters in its form body",status:500});
         else if (messageBody.text==null || messageBody.delete_password==null)
           res.json({msg:"Missing Body parameters: The api needs  message 'text' and 'delete password' ",status:500});
         messageBody.boardname=boardname;
         dbApp.createNewMessage(messageBody,function (err, data) {
           if(err)
             res.json({msg:"Error creating the new message",status:500});
           if(messageBody.source=='test')
               res.json(data);
           else
               res.redirect('/b/'+boardname+"/");
         });

      })
      .get(function (req,res) {
          let boardname=req.params.board;
          if(boardname==null)
              res.json({msg:"Missing boardname: The api needs boardname as a parameter",status:500});
          dbApp.queryMessage(boardname,function (err,data) {
              if(err)
                  res.json({msg:"Error getting-retrieving the message thread",status:500});
              res.json(data);
          });
      })
      .put(function (req,res) {
          let messageBody= req.body;
          if(messageBody==null)
              res.json({msg:"Missing Body: The api needs parameters-to update- in its form body",status:500});
          dbApp.findMessageById(messageBody.thread_id,function (err,data) {
             if(err)
                 res.json({msg:"Failed to find thread with the given id ",status:500});
             dbApp.updateMessage(data,function (err,data) {
               if(err)
                   res.json({msg:"Error reporting the message thread",status:500});
               res.json({msg:"success",status:200});

             });

          });
      })
      .delete(function (req,res) {
          let messageBody=(!req.query.hasOwnProperty("thread_id"))? req.body : req.query;
          if(messageBody==null)
              res.json({msg:"Missing Body: The api needs parameters-to update- in its form body",status:500});
          else if(messageBody.thread_id==null || messageBody.delete_password==null)
              res.json({msg:"Missing Body: The api needs 'thread_id' and 'delete password' for this operation",status:500});
          dbApp.findMessageById(messageBody.thread_id,function (err,data) {
              if(err)
                  res.json({msg:"Failed to find thread with the given id ",status:500});
              else if(data.delete_password!==messageBody.delete_password)
              {
                  res.json({msg:"incorrect password",status:500});
              }
              else {
                  dbApp.deleteMessageById(messageBody.thread_id,function (err,data) {
                      if(err)
                      {
                          res.json({msg:"incorrect password",status:500});
                      }
                      else {
                          res.json({msg:"success",status:200});
                      }
                  });
              }

          });
      });
    
  app.route('/api/replies/:board')
      .post(function (req,res) {

          let boardname=req.params.board;
          if(boardname==null)
              res.json({msg:"Missing boardname: The api needs boardname as a parameter",status:500});
          let messageBody= req.body;
          if(messageBody==null)
              res.json({msg:"Missing Body: The api needs parameters in its form body",status:500});
          else if (messageBody.text==null || messageBody.delete_password==null)
              res.json({msg:"Missing Body parameters: The api needs  message 'text' and 'delete password' ",status:500});
          messageBody.boardname=boardname;
          dbApp.findMessageById(messageBody.thread_id,function (err,data) {
              if(err)
                  res.json({msg:"Failed to find thread with the given id ",status:500});
              dbApp.createNewMessageReplies(data,messageBody,function (err,data) {
                  if(err)
                      res.json({msg:"Failed to create replies",status:500});
                  if(messageBody.source=='test')
                      res.json({_id:data._id,text:data.text,created_on:data.created_on,bumped_on:data.bumped_on,reported:data.reported,replies:data.replies,status:200});
                  else
                      res.redirect('/b/'+boardname+"/"+data._id);
              });

          });

      })
      .get(function (req,res) {
          let thread_id= req.query.thread_id;
          if(thread_id==null)
              res.json({msg:"Missing parameter: The api needs thread_id to get replies",status:500});
          dbApp.findMessageById(thread_id,function (err,data) {
              if(err)
                  res.json({msg:"Failed to find thread with the given id ",status:500});
              dbApp.queryMessageReplies(thread_id,function (err,data) {
                  if(err)
                      res.json({msg:"Error reporting the message thread",status:500});
                  res.json(data);

              });

          });
      })
      .put(function (req,res) {
          let messageBody= req.body;
          if(messageBody==null)
              res.json({msg:"Missing Body: The api needs parameters-to update- in its form body",status:500});
          else if(messageBody.thread_id==null || messageBody.reply_id==null)
              res.json({msg:"Missing Body: The api needs thread_id and relpy_id parameters-to report reply- in its form body",status:500});
          dbApp.findMessageById(messageBody.thread_id,function (err,data) {
              if(err)
                  res.json({msg:"Failed to find thread with the given id ",status:500});
              dbApp.reportMessageReply(data,messageBody.reply_id,function (err,data) {
                  if(err)
                      res.json({msg:"Error reporting the message thread",status:500});
                  res.json({msg:"success",status:200});

              });

          });
      })
      .delete(function (req,res) {
          let messageBody=(!req.query.hasOwnProperty("thread_id"))? req.body : req.query;
          //console.log("MessageBoard==="+JSON.stringify(messageBody));
          if(messageBody==null)
              res.json({msg:"Missing Body: The api needs parameters-to update- in its form body",status:500});
          else if(messageBody.thread_id==null || messageBody.delete_password==null)
              res.json({msg:"Missing Body: The api needs 'thread_id' and 'delete password' for this operation",status:500});
          dbApp.findMessageById(messageBody.thread_id,function (err,data) {
              if(err)
                  res.json({msg:"Failed to find thread with the given id ",status:500});
              if(data.replies.id(messageBody.reply_id)==null)
                  res.json({msg:"Failed to find reply with the given id ",status:500});
              if (data.replies.id(messageBody.reply_id).delete_password!==messageBody.delete_password)
              {
                  res.json({msg:"incorrect password...",status:500});
              }
              else
              {
                  dbApp.deleteMessageReply(data,messageBody.reply_id,messageBody.delete_password,function (err,data) {
                      if(err)
                      {
                          res.json({msg:"Error deleting password...",status:500});
                      }
                      else {
                          res.json({msg:"success",status:200});
                      }
                  });
              }

          });
      });

};
