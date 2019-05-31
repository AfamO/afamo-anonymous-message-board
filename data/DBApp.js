const mongoose=require('mongoose');
const CONNECTION_STRING = process.env.DB;
console.log("Mongo Uri=="+CONNECTION_STRING);
mongoose.connect(CONNECTION_STRING,{useNewUrlParser:true});
var db= mongoose.connection;
db.on('error', console.error.bind(console, 'DB Connection error:'));
db.once('openUri', function() {
    console.log("We're connected to DB!");
});

let Schema = mongoose.Schema;

const threadRepliesSchema = new Schema({
    text:{type:String,default:"My reply",required:true},
    delete_password:{type:String,default:"ciga", required:true},
    created_on:{type:Date,default:Date.now()},
    reported:{type:Boolean,default:false, required:true},

});
const messageThreadSchema = new Schema({
  boardname:{type:String,default:"Game", required:true},
  text:{type:String,default:"My comp failed",required:true},
  delete_password:{type:String,default:"gufu", required:true},
  replies:[threadRepliesSchema],
  created_on:{type:Date,default:Date.now()},
  bumped_on:{type:Date,default:Date.now()},
  reported:{type:Boolean,default:false, required:true},

});

const MessageBoard = mongoose.model('MessageBoard',messageThreadSchema);

const createNewMessage = (newMessage,done) => {
  let message = new MessageBoard(newMessage);
    message.save(function(err,data){
    if(err)
      return done(err);
    done(null,data);
  });
};

const createNewMessageReplies = (messageObject,replies,done) => {
  let repliesArray= messageObject.replies;
   repliesArray.push(replies);
   messageObject.replies=repliesArray;
   messageObject.save(function(err,data){
        if(err)
            return done(err);
        data.bumped_on=data.replies[data.replies.length-1].created_on;
        data.save(function (err,data) {
            if(err)
                return done(err);
            done(null,data);
        })
    });
};
const queryMessageBoard= (boardname,done)=>{
  let query= MessageBoard.find({boardname:boardname});
  query.sort({bumped_on:'asc'});
  query.select('-boardname -reported -delete_password');
  query.where('replies').sort({created_on:'asc'}).limit(3);
  query.limit(10);
  query.exec(function(err,data){
    if(err)
      return done(err);
    var res=data;
    console.log("The Length of Results=="+res.length)
    var results=res.filter((val)=>val.replies.map((element)=>FilteredReply(element)));

      console.log(" Results of MessageBoard=="+JSON.stringify(results));
    done(null,results);
  });
};
const  FilteredReply= function(element) {
    this._id=element._id;
    this.reported=element.reported;
    this.created_on=element.created_on;
    this.text=element.text;
}
/*

 */
const queryMessageReplies= (threadId,done)=>{
    let query= MessageBoard.findOne({_id:threadId});
    query.sort({bumped_on:'asc'});
    query.select('-boardname -reported -delete_password');
    query.exec(function(err,data){
        if(err)
            return done(err);
        done(null,data);
    });
};

const findMessageById =(threadId,done)=>{
    MessageBoard.findOne({_id:threadId},function(err,data){
      if(err)
            done(err);
      done(null,data);
    });
};

const deleteMessageById =(threadId,done)=>{
    MessageBoard.deleteOne({_id:threadId},function(err,data){
      if(err)
            done(err);
        done(null,data);
    });
};
const deleteMessageReply =(messageObject,replyId,deletePassword,done)=>{
    messageObject.replies.id(replyId).text ='[deleted]';
    messageObject.save(function(err,data){
        if(err)
            done(err);
        done(null,data);

    });
};

const getMessageReply =(messageObject,replyId)=>{
    return messageObject.replies.id(replyId);
};

const updateMessage = function(retrievedData, done) {
        retrievedData.reported=true;
        retrievedData.save(function(err,data){
            if(err)
                done(err);
            done(null,data);
        });
      };

const reportMessageReply = function(messageObject,replyId, done) {
    messageObject.replies.id(replyId).reported=true;
    messageObject.save(function(err,data){
        if(err)
            done(err);
       // console.log("The result of reportMessageReply=="+JSON.stringify(data));
        done(null,data);

    });
};

exports.createNewMessage =       createNewMessage;
exports.deleteMessageById =      deleteMessageById;
exports.findMessageById =        findMessageById;
exports.queryMessage=            queryMessageBoard;
exports.updateMessage=           updateMessage;
exports.queryMessageReplies =    queryMessageReplies;
exports.createNewMessageReplies= createNewMessageReplies;
exports.reportMessageReply =     reportMessageReply;
exports.deleteMessageReply =     deleteMessageReply;