let displayMode = localStorage.getItem("paydayDisplayMode") || "standard";


let settings = JSON.parse(localStorage.getItem("paydaySettings")) || {

savingsMinimum:100,

leftoverTarget:150,

payFrequency:"Bi-Weekly",

nextPayDate:""

};



let bills = JSON.parse(localStorage.getItem("paydayBills")) || [

{name:"Rent",amount:1150,due:"1st",type:"Housing",priority:1},
{name:"Student Loan 1",amount:100,due:"5th",type:"Loan",priority:1},
{name:"Spotify",amount:12,due:"12th",type:"Subscription",priority:3},
{name:"Electric",amount:75,due:"16th",type:"Utility",priority:1},
{name:"Student Loan 2",amount:238,due:"18th",type:"Loan",priority:1},
{name:"JCPenney Card",amount:50,due:"18th",type:"Debt",priority:2},
{name:"Credit Card",amount:300,due:"22nd",type:"Debt",priority:2},
{name:"Personal Loan",amount:444,due:"28th",type:"Debt",priority:2},
{name:"Mom",amount:200,due:"Monthly",type:"Family",priority:1}

];



const budget = {

income:4368,

paycheck:2184,

creditCard:16250,

personalLoans:17000,

studentLoans:30000

};



function saveBills(){

localStorage.setItem(
"paydayBills",
JSON.stringify(bills)
);

}



function saveSettings(){

localStorage.setItem(
"paydaySettings",
JSON.stringify(settings)
);

}



function saveDisplayMode(){

localStorage.setItem(
"paydayDisplayMode",
displayMode
);

}



function setDisplayMode(mode){

displayMode = mode;

saveDisplayMode();

loadPage("settings");

}



function card(title,value,color=""){

return `

<div class="panel">

<div class="card-label">
${title}
</div>

<div class="card-value ${color}">
${value}
</div>

</div>

`;

}
function loadPage(page){

const app=document.getElementById("app");



if(page==="dashboard"){


let required = bills
.filter(b=>b.priority===1)
.reduce((s,b)=>s+b.amount,0);


let debt = bills
.filter(b=>b.priority===2)
.reduce((s,b)=>s+b.amount,0);


let goals = bills
.filter(b=>b.priority===3)
.reduce((s,b)=>s+b.amount,0);



if(displayMode==="standard"){


app.innerHTML=`

<div class="panel">

<h2>
Dashboard
</h2>


<p>
Monthly Income:
<b>
$${budget.income}
</b>
</p>


<p>
Required Bills:
<b>
$${required}
</b>
</p>


<p>
Debt Payments:
<b>
$${debt}
</b>
</p>


<p>
Goals:
<b>
$${goals}
</b>
</p>


</div>


<div class="panel">

<div class="status">
Standard Mode Active
</div>

</div>

`;



}else{


app.innerHTML=`

<div class="panel">

<h2>
PAYDAY STATUS
</h2>


${card(
"INCOME",
"$"+budget.income,
"green"
)}


${card(
"REQUIRED LOAD",
"$"+required,
"red"
)}


${card(
"DEBT LOAD",
"$"+debt,
"yellow"
)}


${card(
"GOAL LOAD",
"$"+goals,
"green"
)}


<div class="status">
Graphic Mode Active
</div>


</div>

`;

}


}




if(page==="settings"){


app.innerHTML=`

<div class="panel">

<h2>
PayDay Settings
</h2>


<h3>
Display Mode
</h3>


<button onclick="setDisplayMode('standard')">
Standard Mode
</button>


<button onclick="setDisplayMode('graphic')">
Graphic Mode
</button>



<h3>
Savings Minimum Per Paycheck
</h3>


<input 
id="saveAmount"
type="number"
value="${settings.savingsMinimum}"
>


<h3>
Leftover Cash Target
</h3>


<input
id="cashTarget"
type="number"
value="${settings.leftoverTarget}"
>


<h3>
Pay Frequency
</h3>


<select id="frequency">

<option ${settings.payFrequency==="Weekly"?"selected":""}>
Weekly
</option>


<option ${settings.payFrequency==="Bi-Weekly"?"selected":""}>
Bi-Weekly
</option>


<option ${settings.payFrequency==="Monthly"?"selected":""}>
Monthly
</option>


</select>


<h3>
Next Pay Date
</h3>


<input
id="payDate"
value="${settings.nextPayDate}"
placeholder="MM/DD/YYYY"
>


<br><br>


<button onclick="saveUserSettings()">
Save Settings
</button>


</div>

`;

}
if(page==="bills"){


let rows="";


bills.forEach((b,index)=>{


rows+=`

<tr>

<td>${b.name}</td>

<td>$${b.amount}</td>

<td>${b.due}</td>

<td>${b.type}</td>

<td>${b.priority}</td>


<td>

<button onclick="deleteBill(${index})">
Delete
</button>

</td>


</tr>

`;

});


app.innerHTML=`

<div class="panel">

<h2>
Bill Control Panel
</h2>


<table>

<tr>

<th>Name</th>

<th>Amount</th>

<th>Due</th>

<th>Category</th>

<th>Priority</th>

<th></th>

</tr>


${rows}


</table>


<br>


<h3>
Add Bill
</h3>


<input id="billName" placeholder="Bill Name">


<input id="billAmount" placeholder="Amount">


<input id="billDue" placeholder="Due Date">


<select id="billType">

<option>Housing</option>

<option>Debt</option>

<option>Loan</option>

<option>Utility</option>

<option>Subscription</option>

<option>Goal</option>

</select>



<select id="billPriority">

<option value="1">
Priority 1 - Required
</option>

<option value="2">
Priority 2 - Debt
</option>

<option value="3">
Priority 3 - Goal
</option>

</select>



<button onclick="addBill()">
Add Bill
</button>


</div>

`;

}




if(page==="paycheck"){


let required = bills
.filter(b=>b.priority===1)
.reduce((s,b)=>s+b.amount,0);



let debt = bills
.filter(b=>b.priority===2)
.reduce((s,b)=>s+b.amount,0);



let available =
budget.paycheck
-
required
-
debt
-
settings.savingsMinimum
-
settings.leftoverTarget;



app.innerHTML=`

<div class="panel">

<h2>
Paycheck
</h2>


<p>
Income:
<b>
$${budget.paycheck}
</b>
</p>


<p>
Priority 1 Bills:
<b>
$${required}
</b>
</p>


<p>
Priority 2 Debt:
<b>
$${debt}
</b>
</p>


<p>
Savings:
<b>
$${settings.savingsMinimum}
</b>
</p>


<p>
Protected Cash:
<b>
$${settings.leftoverTarget}
</b>
</p>


<h3>
Available:
$${available}
</h3>


</div>

`;

}




if(page==="reports"){


let totalDebt =
budget.creditCard+
budget.personalLoans+
budget.studentLoans;


app.innerHTML=`

<div class="panel">

<h2>
Reports
</h2>


<p>
Total Debt:
<b>
$${totalDebt.toLocaleString()}
</b>
</p>


<p>
Monthly Bills:
<b>
$${bills.reduce((s,b)=>s+b.amount,0)}
</b>
</p>


</div>

`;

}




if(page==="scenario"){


app.innerHTML=`

<div class="panel">

<h2>
Scenario Mode
</h2>


<div class="status">
Simulation Only
</div>


</div>

`;

}


}




function saveUserSettings(){

settings.savingsMinimum =
Number(document.getElementById("saveAmount").value);


settings.leftoverTarget =
Number(document.getElementById("cashTarget").value);


settings.payFrequency =
document.getElementById("frequency").value;


settings.nextPayDate =
document.getElementById("payDate").value;



saveSettings();


loadPage("settings");

}





function addBill(){


let bill={

name:document.getElementById("billName").value,

amount:Number(document.getElementById("billAmount").value),

due:document.getElementById("billDue").value,

type:document.getElementById("billType").value,

priority:Number(document.getElementById("billPriority").value)

};



if(bill.name && bill.amount){

bills.push(bill);

saveBills();

loadPage("bills");

}


}




function deleteBill(index){

bills.splice(index,1);

saveBills();

loadPage("bills");

}



saveBills();

saveSettings();

loadPage("dashboard");