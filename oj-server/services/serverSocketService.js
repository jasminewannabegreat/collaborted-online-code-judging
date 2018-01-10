const redisClient = require('../modules/redis');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io){

    const socketIdToSessionId = {};
    const collaborations = {};
    const sessionPath = '/ojserver';//for redis in this project
    io.on('connection',(socket)=>{
        // console.log(socket);
        const sessionId = socket.handshake.query['sessionId'];
        // put (socket id, sessionId) to the map
        socketIdToSessionId[socket.id] = sessionId;
        // if (!(sessionId in collaborations)){
        //     collaborations[sessionId] = {
        //       'participants':[]
        //     };
        // }
        if ( sessionId in collaborations ){
          collaborations[sessionId]['participants'].push(socket.id);
        }
        else{
          redisClient.get(sessionPath + sessionId,function(data){
              if(data){
                  console.log("session terminated previously, data pulling back..");
                  collaborations[sessionId] = {
                    'cachedInstructions':JSON.parse(data),
                    'participants':[]
                  }
              }
              else{
                console.log("you are the first one in this problem");
                collaborations[sessionId] = {
                  'cachedInstructions':[],
                  'participants':[]
                }
              }
             collaborations[sessionId]['participants'].push(socket.id);
          });
        }



        socket.on('change',delta =>{
          console.log('change ' + socketIdToSessionId[socket.id] + ' ' + delta);
          const sessionId = socketIdToSessionId[socket.id];
          if(sessionId in collaborations ){
              collaborations[sessionId]['cachedInstructions'].push(
                ['change',delta,Date.now()]
              )
          }
            forwardEvent(socket.id, 'change', delta);
        });

        socket.on('cursorMove',(cursor)=>{
            console.log('change ' + socketIdToSessionId[socket.id] + ' ' + cursor);
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socket.id;
            forwardEvent(socket.id,'cursorMove', JSON.stringify(cursor));
        });

        socket.on('restoreBuffer',()=>{
            const sessionId = socketIdToSessionId[socket.id];
            if(sessionId in collaborations){
              const cachedInstructions = collaborations[sessionId]['cachedInstructions'];
              for (let ins of cachedInstructions){
                socket.emit(ins[0],ins[1]);
              }
            }
            else{
              console.log("warning");
            }
        });

        socket.on('disconnect', ()=>{
            const sessionId = socketIdToSessionId[socket.id];
            let foundAndRemove = false;
            if (sessionId in collaborations){
                const participants = collaborations[sessionId]['participants'];
                const index = participants.indexOf(socket.id);
                if(index >= 0){
                  participants.splice(index,1);
                  foundAndRemove = true;
                  if(participants === 0 ){
                      const key = sessionPath +sessionId;
                      const value = JSON.stringify(collaborations[sessionId]['cachedInstructions']);
                      redis.set(key, value, redisClient.redisPrint);
                      redis.expire(key,TIMEOUT_IN_SECONDS);
                      delete(collaborations[sessionId]);
                  }
                }
            }
            else{
              console.log("warning");
            }
            if(!foundAndRemove){
              console.log('error');
            }
        })
    });

    const forwardEvent = function(socketId, eventname, datastring){
      const sessionId = socketIdToSessionId[socketId];
      if (sessionId in collaborations) {
        const participants = collaborations[sessionId]['participants'];
        for (let item of participants ){
            if(socketId != item){
              io.to(item).emit(eventname,datastring);
            }
        }
      }
      else {
        console.log('You have a bug');
      }
    }
}
