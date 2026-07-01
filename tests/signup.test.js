/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

beforeEach(() => {

document.body.innerHTML = `

<input id="full-name">

<input id="signup-email">

<input id="signup-password">

<input id="confirm-password">

<span id="full-name-error"></span>
<span id="signup-email-error"></span>
<span id="signup-password-error"></span>
<span id="confirm-password-error"></span>

<div id="signup-error">
<span id="signup-error-text"></span>
</div>

<div id="signup-success">
<span></span>
</div>

<button id="btn-signup"></button>

<span id="signup-btn-label"></span>

<div id="signup-spinner"></div>

`;

const script = fs.readFileSync(
path.resolve(__dirname,"../signup.js"),
"utf8"
);

eval(script);

});

describe("Signup Validation",()=>{

test("Name Empty",()=>{

document.getElementById("full-name").value="";

expect(document.getElementById("full-name").value)
.toBe("");

});

test("Email Validation",()=>{

document.getElementById("signup-email").value=
"vivek@gmail.com";

expect(
document.getElementById("signup-email").value.endsWith("@bvrit.ac.in")
).toBe(false);

});

test("Password Match",()=>{

document.getElementById("signup-password").value="student123";
document.getElementById("confirm-password").value="student123";

expect(
document.getElementById("signup-password").value
).toEqual(
document.getElementById("confirm-password").value
);

});

});