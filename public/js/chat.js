const socket=io()

//Elements

const messageForm=document.querySelector("form")
const messageInput=messageForm.querySelector("input")
const messageFormButton=messageForm.querySelector("button")
const sendLocationButton=document.querySelector("#send_location")
const messages=document.querySelector("#messages")

//Templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML
//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoScroll=()=>{
    //new Message Element
    const $newMessage=messages.lastElementChild

    //Height of the new Message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=messages.offsetHeight

    //Height of messages container
    const containerHeight=messages.scrollHeight
    //How far i scrolled
    const scrollOffset=messages.scrollTop+visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop=messages.scrollHeight
    }
}



socket.on('message',(message)=>{
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:m a')   
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    messageFormButton.setAttribute('disabled','disabled')
    socket.emit('Send Message',e.target.elements.Message.value,(error)=>{
        messageFormButton.removeAttribute('disabled')
        messageInput.value=""
        messageInput.focus()
        if(error){
           return alert(error)
        }
        
    })
})
sendLocationButton.addEventListener('click',()=>{
    sendLocationButton.setAttribute("disabled","disabled")
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position)=>{
                socket.emit('Send Location',{latitude:position.coords.latitude,longitude:position.coords.longitude},()=>{
                    sendLocationButton.removeAttribute("disabled")

                })
            }
        )
    } 
    else{
        sendLocationButton.removeAttribute("disabled")
        return alert('geolocation is not supported')
    }
})

socket.on('locationMessage',(location)=>{
    const html=Mustache.render(locationTemplate,{username:location.username,location:location.url,createdAt:moment(location.createdAt).format('h:m a')})
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{room,users})
    document.querySelector("#sidebar").innerHTML=html
})