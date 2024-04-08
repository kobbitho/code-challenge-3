// Your code here
let baseURL = "http://localhost:3000/films/";
let ulFilms = document.getElementById("films");
let idBuyticket = document.getElementById("buy-ticket")

let movieImg = document.getElementById("poster");
let idTitle = document.getElementById("title")
let idRuntime = document.getElementById("runtime")
let idFilmInfo = document.getElementById("film-info")
let idShowtime = document.getElementById("showtime")
let idTicketnum = document.getElementById("ticket-num")


function grabMovie(){  
    // fetches data from  db.json and display it in the user interface
    fetch(baseURL)
    .then(response => response.json())// converts the response to json
    .then(data => { 
        ulFilms.innerHTML = "";
        for(values of data){  // loops through the response to create an unordered list of film titles
             addMovie(values);
        }
        }
    )
    .catch(error => console.log(error.message));
}
grabMovie();
function addMovie(movies){ 
    //this function creates and appends a new list item to the unordered list element in the HTML document.
    
    let remaining = movies.capacity - movies.tickets_sold;// calculates available tickets

    movieTitle = movies.title
    movieId = movies.id

    let liFilm = document.createElement("li");

    if(!remaining > 0)
    {  liFilm.className = "sold-out"  //if the number of tickets remaining is <= 0 "sold-out" is added to the list item to show that the tickets are not available.
    }

    ulFilms.appendChild(liFilm);

    let movieSpan = document.createElement("span");
    movieSpan.innerText = movieTitle;
    liFilm.appendChild(movieSpan);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete"
    liFilm.appendChild(deleteButton); 

    deleteButton.addEventListener('click', () => {
        deleteMovie(movies)
    })
    movieSpan.addEventListener('click', () => {
        updateDom(movies);
    })
    if(movies.id === "1"){
        updateDom(movies); // updates movie details in the user interface according to movie ID
    }
}

function updateDom(movies){
    // updates movie details in the user interface according to movie ID
    let remaining = movies.capacity - movies.tickets_sold;
    let movieId = movies.id; 
    let availability;

    if(remaining > 0){
        availability = "Buy Ticket"
    }else{
        availability = "Sold out"
    }// checks ticket availability

    movieImg.src = movies.poster; 
    movieImg.alt = movies.title; 
    idTitle.innerText = movies.title;
    idRuntime.innerText = movies.runtime + " minutes";
    idFilmInfo.innerText = movies.description;
    idShowtime.innerText = movies.showtime;
    idTicketnum.innerText = remaining;

    idBuyticket.onclick = () => {
        if(remaining > 0)
        { 
             buyTicket(movies)
        }else{
            console.log("You cannot buy tickets")
        }//sets an event listener for the "Buy Ticket" button.on click,it calls the bytTicket(movies) function
    };
    idBuyticket.dataset.movieId = movies.id;
    let button = document.querySelector(`[data-movies-id="${movieId}"]`);
    button.innerText = availability;
}
function buyTicket(movies){
    movies.tickets_sold++ // Increments the number of tickets sold by 1
    let ticketsSold = movies.tickets_sold;// Stores the updated number of tickets sold
    let requestHeaders = {
        "Content-Type": "application/json"
    };// Request headers for the PATCH request
    let requestBody = {
        "tickets_sold": ticketsSold  // Request body containing the updated number of tickets sold
    }
    fetch(baseURL + movies.id,{ //Sends a PATCH request to update the movie's details in the database
        method: "PATCH",
        headers: requestHeaders,    
        body: JSON.stringify(requestBody)
    })
    .then (response => response.json()) // Converts the response to JSON format
    .then(data => {
        updateDom(data);
        //after receiving a successful response, it parses the response into JSON format and updates the movie details in the user interface using the updateDom(data) function.

        let numberOfTickets = (data.capacity - data.tickets_sold)

        if(!numberOfTickets > 0)
        { grabMovie();    // If there are no more tickets available, fetches the updated list of movies
        }

        let  RequestBodyTickets =  {
            "film_id": data.id,
            "number_of_tickets": numberOfTickets // Creates a new ticket object with the movie id and the remaining number of tickets
         }

        fetch("http://localhost:3000/tickets",{  // Sends a POST request to create a new ticket
            method: "POST",
            headers: requestHeaders,    
            body: JSON.stringify(RequestBodyTickets)
        })
        .then (response => response.json())
        .then(data => data)  //Returns the newly created ticket
        .catch (error => console.log(error.message));

    })
    .catch (error => console.log(error.message));
};
function deleteMovie(movie){
    let requestHeaders = {
        "Content-Type": "application/json"
    }//this function deletes a movie form the database and updates the user interface accordingly.
    const requestBody = {
        "id": movie.id
    };
    fetch(baseURL + movie.id, {
        method: "DELETE",
        headers: requestHeaders,    
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => grabMovie())
    .catch(error => console.log(error.message));
}
