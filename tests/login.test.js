/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

beforeEach(() => {

document.body.innerHTML = `
<input id="email">
<input id="password">

<span id="email-error"></span>
<span id="password-error"></span>

<div id="login-error">
<span></span>
</div>

<div id="login-success">
<span></span>
</div>

<button id="btn-login"></button>

<span id="btn-label"></span>

<div id="login-spinner"></div>

<input id="remember-me" type="checkbox">

<div class="role-tab" data-role="student"></div>

<span id="demo-email"></span>
<span id="demo-pass"></span>
`;

const script = fs.readFileSync(
path.resolve(__dirname,"../script.js"),
"utf8"
);

eval(script);

});

describe("Email Validation",()=>{

test("Valid Email",()=>{

expect(validateEmail("abc@bvrit.ac.in")).toBeNull();

});

test("Invalid Email",()=>{

expect(validateEmail("abc@gmail.com"))
.toBe("Only @bvrit.ac.in emails are allowed.");

});

});

describe("Password Validation",()=>{

test("Valid Password",()=>{

expect(validatePassword("abcdef")).toBeNull();

});

test("Short Password",()=>{

expect(validatePassword("123"))
.toBe("Password must be at least 6 characters.");

});

});

describe("Demo Login",()=>{

test("Correct Credentials",()=>{

demoFallbackLogin(
"student@bvrit.ac.in",
"student123"
);

expect(sessionStorage.getItem("pathshala_user"))
.not.toBeNull();

});

});