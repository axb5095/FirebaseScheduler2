// Initialize Firebase
var config = {
	apiKey: "AIzaSyBZBlf96WNT4FC7--AMDLjMvfFNFzug78k",
	authDomain: "fir-train-scheduler-62912.firebaseapp.com",
	databaseURL: "https://fir-train-scheduler-62912.firebaseio.com",
	projectId: "fir-train-scheduler-62912",
	storageBucket: "fir-train-scheduler-62912.appspot.com",
	messagingSenderId: "248917561607"
};
firebase.initializeApp(config);

// Connect to the Firebase database
var database = firebase.database();

function displayCurrentTime() {
setInterval(function(){
    $('#current-time').html(moment().format('hh:mm A'))
  }, 1000);
}
displayCurrentTime();



//CDelete Schedule...
 $("body").on("click", ".trash-can", function(){
	// Prevent form from submitting
	event.preventDefault();

	
	var confirmDelete = confirm("This will rmove the train from the system. Are you sure you want to delete this train?");
	
	if (confirmDelete) {
		//Remove the closest table row.
		$(this).closest('tr').remove();
	
	}

	else {
		return;
	}
});


$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$("#add-train").on("click", function() {
	// Prevent form from submitting
	event.preventDefault();

	//Get the values fom the text boxes
	var trainName = $("#train-name").val().trim();
	var destination = $("#destination").val().trim();
	var TrainTime = $("#first-train-time").val().trim();
	var Frequency = $("#frequency").val().trim();

	console.log(trainName, destination, TrainTime, Frequency)



	//Validate the values 
	if (trainName === "" || destination === "" || TrainTime === "" || Frequency === ""|| 
		   trainName === null || destination === null || TrainTime === null || Frequency === null){
		$("#not-military-time").empty();
	    $("#not-a-number").empty();
		$("#missing-field").html("Please enter all the fields to schedule the train.");
		return false;		
	}

	//Check for  military time.
	if (TrainTime.length !== 5 || TrainTime.substring(2,3)!== ":") {
		$("#missing-field").empty();
		$("#not-a-number").empty();
		$("#not-military-time").html("Enter Time  in military format: HH:mm. For example, 15:00.");
		return false;
	}

	//Check Frequency value.
	if (isNaN(Frequency)) {
    	$("#missing-field").empty();
    	$("#not-military-time").empty();
    	$("#not-a-number").html("Not a number. Enter time in minutes).");
    	return false;
	}

	//Form is valid 
    $("#not-military-time").empty();
	$("#missing-field").empty();
	$("#not-a-number").empty();

	 var MinutesTillNextTrain = 0;

    // Current Time
	var currentTime = moment();
	var TimeConverted = moment(TrainTime, "hh:mm").subtract(1, "years");
	var difference = moment().diff(moment(TimeConverted), "minutes");
	var Remainder = difference % Frequency;
	var MinutesTillNextTrain = Frequency - Remainder;
	var nextTrain = moment().add(MinutesTillNextTrain, "minutes").format("hh:mm A");

	 var newTrain = {
			trainName: trainName,
			destination: destination,
			firstTrainTime: TrainTime,
			trainFrequency: Frequency,
			nextTrain: nextTrain,
			tMinutesTillTrain: MinutesTillNextTrain,
			currentTime: currentTime.format("hh:mm A")
		}; 

		database.ref().push(newTrain);

			//Confirmation modal that appears when user submits form and train is added successfully to the schedule.
		$(".add-train-modal").html("<p>" + newTrain.trainName + " was successfully added to the current schedule.");
		$('#addTrain').modal();

		//Remove the text from the form boxes after user presses the add to schedule button.
		$("#train-name").val("");
		$("#destination").val("");
		$("#first-train-time").val("");
		$("#frequency").val("");	


	
});

database.ref().on("child_added", function(childSnapshot, prevChildKey) {

	//Set variables for form input field values equal to the stored values in firebase.
	var trainName = childSnapshot.val().trainName;
	var destination = childSnapshot.val().destination;
	var firstTrainTime = childSnapshot.val().firstTrainTime;
	var trainFrequency = childSnapshot.val().trainFrequency;
	var nextTrain = childSnapshot.val().nextTrain;
	var tMinutesTillTrain = childSnapshot.val().MinutesTillTrain;
	var currentTime = childSnapshot.val().currentTime;

    var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
    var currentTime = moment();
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    var tRemainder = diffTime % trainFrequency;
    var tMinutesTillTrain = trainFrequency - tRemainder;
    var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("hh:mm A");
 


    var tRow = "";

 
	//Update the HTML (schedule table) to reflect the latest stored values in the firebase database.
	var tRow = $("<tr>");
	var trainTd = $("<td>").text(trainName);
    var destTd = $("<td>").text(destination);
    var nextTrainTd = $("<td>").text(nextTrain);
    var trainFrequencyTd = $("<td>").text(trainFrequency);
    var tMinutesTillTrainTd = $("<td>").text(tMinutesTillTrain);

    tRow.append("<img src='assets/images/if_trash_1608958.svg' alt='trash can' class='trash-can mr-3'>", trainTd, destTd, trainFrequencyTd, nextTrainTd, tMinutesTillTrainTd);
    // Append the table row to the table body
    $("table > tbody").append(tRow);
});

	    
