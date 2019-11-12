const generateLocation=(url,username)=>{
    return {
        username,
        url,
        createdAt:new Date().getTime() 
       }
}
module.exports={
    generateLocation
}