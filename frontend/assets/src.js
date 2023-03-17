const images =[
  "./media/images/start.jpg",
  "./media/images/img1.jpg",
  "./media/images/img2.jpg",
  "./media/images/img3.jpg",
  "./media/images/img4.jpg",
  "./media/images/img5.jpg",
  "./media/images/img6.jpg",
  "./media/images/img7.jpg",
  "./media/images/img8.jpg",
  "./media/images/img9.jpg",
  "./media/images/img10.jpg",
  "./media/images/img11.jpg",
  "./media/images/img12.jpg",
  "./media/images/img13.jpg",
  "./media/images/end.jpg"
  // ...
];

const leftArrow = document.getElementById("left-arrow")
const rightArrow =document.getElementById("right-arrow")

const imagesContainer = document.createElement("div");
imagesContainer.classList.add("images-container");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

let swipeWidth;


for (const image of images) {

  const img = document.createElement("img");
  img.src = image;


  const likeBtn = document.createElement("div");
  likeBtn.classList.add("like-btn");
  likeBtn.onclick = function(event) {
    event.stopPropagation();
    playSound("./media/sounds/like.mp3")
    this.classList.toggle('active');
  };
  const likeIcon = document.createElement("i");
  likeIcon.className = "far fa-thumbs-up";
  likeBtn.appendChild(likeIcon);

  const dislikeBtn = document.createElement("div");
  dislikeBtn.classList.add("dislike-btn");
  dislikeBtn.onclick = function(event) {
    event.stopPropagation();
    playSound("./media/sounds/dislike.mp3")
    this.classList.toggle('active');
  };
  const dislikeIcon = document.createElement("i");
  dislikeIcon.className = "far fa-thumbs-down";
  dislikeBtn.appendChild(dislikeIcon);

  const excitingBtn = document.createElement("div");
  excitingBtn.classList.add("exciting-btn");
  excitingBtn.onclick = function(event) {
    event.stopPropagation();
    playSound("./media/sounds/exciting.mp3")
    this.classList.toggle('active');
  };
  const excitingIcon = document.createElement("i");
  excitingIcon.className = "far fa-grin-stars";
  excitingBtn.appendChild(excitingIcon);

  const frame = document.createElement("div");
  frame.classList.add("frame");
  frame.appendChild(img);
  frame.appendChild(likeBtn);
  frame.appendChild(dislikeBtn);
  frame.appendChild(excitingBtn);
  frame.onclick = function() {
    playSound("./media/sounds/select.mp3")
    this.classList.toggle("selected")
  };


  imagesContainer.appendChild(frame);
}

document.body.appendChild(imagesContainer);

window.onload = () => {
  imagesContainer.scrollLeft = 0;
  swipeWidth =  frames[1].offsetLeft;
  frames[1].classList.add("focused");
};

let currentFrame = 1;
const frames = imagesContainer.children;
imagesContainer.addEventListener("scroll", () => {
  // tell me where am i, depends on the scroll value
  currentFrame = Math.round(imagesContainer.scrollLeft /(imagesContainer.clientWidth /3) + 1);

  for (let i = 0; i < frames.length; i++) {
    frames[i].classList.remove("focused");
  }

  if (currentFrame >= 0 && currentFrame < frames.length) {
    frames[currentFrame].classList.add("focused");
  }
});


nextBtn.addEventListener("click", () => {
  scrollRight();
});


prevBtn.addEventListener("click", () => {
  scrollLeft();
});


document.onkeydown = function (event) {
  switch (event.keyCode) {
    case 37:
      scrollLeft();
      break;
    case 39:
      scrollRight();
      break;
  }
};

function scrollRight() {
  frames[currentFrame].classList.remove('selected');
  playSound("./media/sounds/swipe.mp3")
  imagesContainer.scrollTo({
    left: imagesContainer.scrollLeft + swipeWidth ,
    behavior: "smooth"
  });
  rightArrow.style.transform = "translateX(40px)";
  rightArrow.addEventListener("transitionend", ()=> {
    rightArrow.style.transform = "translateX(0px)";
  });
}

function scrollLeft() {
  frames[currentFrame].classList.remove('selected');
  playSound("./media/sounds/swipe.mp3")
  imagesContainer.scrollTo({
    left: imagesContainer.scrollLeft -swipeWidth ,
    behavior: "smooth"
  });
  leftArrow.style.transform = "translateX(-40px)";
  leftArrow.addEventListener("transitionend", ()=> {
    leftArrow.style.transform = "translateX(0px)";
  });
}


function playSound(path) {
  const audio = new Audio(path);
  audio.play();
}

////MQTT/////
// Create a client instance
const client = new Paho.MQTT.Client("localhost",8080,"", "browser");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("gesture");
  message = new Paho.MQTT.Message("Hello");
  message.destinationName = "gesture";
  client.send(message); 
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

let MqttMessage = [];
let flag = false;
let areEqual; 

// called when a message arrives only if the message changed
function onMessageArrived(message) {

  if (flag) return;

  flag = true;
  MqttMessage.push(message.payloadString)
  // console.log(MqttMessage)
  if (MqttMessage.length >= 2){
    // Get the last 4 elements of the array
    const lastFour = MqttMessage.slice(-2);
    // Check if all the elements are equal
    areEqual = lastFour.every((element) => element === lastFour[0]);
  }else{
    areEqual= false;
  }

  if (areEqual) {
    console.log(message.payloadString);

    // the switch is innocent !
    switch (message.payloadString){
      case "17": // swipping right
        scrollLeft();
        break;
      case "16": // swipping left
        scrollRight();
        break;
      case "19": // thumb down
        playSound("./media/sounds/dislike.mp3")
        frames[currentFrame].querySelector(".dislike-btn").classList.toggle('active');
        break;
      case "20": // thumb up
        playSound("./media/sounds/like.mp3")
        frames[currentFrame].querySelector(".like-btn").classList.toggle('active');
        break;
      case "1": // Drumming Fingers
        playSound("./media/sounds/exciting.mp3")
        frames[currentFrame].querySelector(".exciting-btn").classList.toggle('active');
        break;
      case "25": // Zooming Out With Full Hand
        playSound("./media/sounds/select.mp3")  
        frames[currentFrame].classList.toggle('selected');
        break;
      default:
        break;
    }
    MqttMessage = []
  }
  flag=false;
}

// catigories = [
//   "Doing other things",  // 0
//   "Drumming Fingers",  // 1
//   "No gesture",  // 2
//   "Pulling Hand In",  // 3
//   "Pulling Two Fingers In",  // 4
//   "Pushing Hand Away",  // 5
//   "Pushing Two Fingers Away",  // 6
//   "Rolling Hand Backward",  // 7
//   "Rolling Hand Forward",  // 8
//   "Shaking Hand",  // 9
//   "Sliding Two Fingers Down",  // 10
//   "Sliding Two Fingers Left",  // 11
//   "Sliding Two Fingers Right",  // 12
//   "Sliding Two Fingers Up",  // 13
//   "Stop Sign",  // 14
//   "Swiping Down",  // 15
//   "Swiping Left",  // 16
//   "Swiping Right",  // 17
//   "Swiping Up",  // 18
//   "Thumb Down",  // 19
//   "Thumb Up",  // 20
//   "Turning Hand Clockwise",  // 21
//   "Turning Hand Counterclockwise",  // 22
//   "Zooming In With Full Hand",  // 23
//   "Zooming In With Two Fingers",  // 24
//   "Zooming Out With Full Hand",  // 25
//   "Zooming Out With Two Fingers"  // 26
// ]
