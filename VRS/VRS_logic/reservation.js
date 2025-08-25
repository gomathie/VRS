/*Assignment 1: Use JavaScript to validate a form*/
"use strict";

// Regular expression that validates the phone number.
const phonePattern = /^\d{3}-\d{3}-\d{4}$/;

/**
 * Function that reset the errors in the span elements.
 */
const resetErrors = () => {
	$("#pickup_date").next().text("");
	$("#days").next().text("");
	$("#name").next().text("");
	$("#email").next().text("");
	$("#phone").next().text("");
};

/**
 * Function that validate the form and if everything is correct, it will submit it.
 * @param {} evt Input Clicked.
 * @param {*} emailPattern Regular expression that helps to validate the email
 */
const submitForm = (evt, emailPattern) => {
	// Call to the function that reset errors.
	resetErrors();

	// Variables
	let isValid = true;
	//Pickup Date
	let pickUpDate = $("#pickup_date").val().trim();
	$("#pickup_date").val(pickUpDate);
	//No. Days
	let noDays = $("#days").val().trim();
	$("#days").val(noDays);
	//Name
	let name = $("#name").val().trim();
	$("#name").val(name);
	//Email
	let email = $("#email").val().trim();
	$("#email").val(email);
	//Phone
	let phone = $("#phone").val().trim();
	$("#phone").val(phone);

	// Entries validations.
	//Pickup Date
	const pickUpDateSplit = pickUpDate.split("/");
	if (pickUpDate == "") {
		$("#pickup_date").next().text("Please enter a date.");
		isValid = false;
	} else if (pickUpDateSplit.length != 3) {
		$("#pickup_date").next().text("Please enter a date in mm/dd/yyyy format.");
		isValid = false;
	} else if (isNaN(pickUpDateSplit[0]) || isNaN(pickUpDateSplit[1]) || isNaN(pickUpDateSplit[2])) {
		$("#pickup_date").next().text("Please enter a date in mm/dd/yyyy format.");
		isValid = false;
	} else if (new Date(pickUpDate) == "Invalid Date") {
		$("#pickup_date").next().text("Please enter a date in mm/dd/yyyy format.");
		isValid = false;
	}
	//No. Days
	if (noDays == "") {
		$("#days").next().text("Please enter a no. days.");
		isValid = false;
	} else if (isNaN(noDays)) {
		$("#days").next().text("Please enter a number.");
		isValid = false;
	}
	//Name
	if (name == "") {
		$("#name").next().text("Please enter a name.");
		isValid = false;
	}
	//Email
	if (email == "") {
		$("#email").next().text("Please enter an email.");
		isValid = false;
	} else if (!emailPattern.test(email)) {
		$("#email").next().text("Please enter a valid email.");
		isValid = false;
	}
	//Phone
	if (phone == "") {
		$("#phone").next().text("Please enter a phone number.");
		isValid = false;
	} else if (!phonePattern.test(phone)) {
		$("#phone").next().text("Please enter a valid phone 999-999-9999.");
		isValid = false;
	}

	// If statement that validates if there's an error to prevent the submit of the form.
	if (!isValid) {
		evt.preventDefault();
	}
};

$(document).ready(() => {
	const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;

	$("#submit").click((evt) => submitForm(evt, emailPattern));
}); // end ready
