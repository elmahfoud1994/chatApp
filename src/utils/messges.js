const gernerateMessage=(message,username)=>{
    return{
        username,
        text:message,
        createdAt:new Date().getTime()
    }
}
module.exports={
    gernerateMessage
}